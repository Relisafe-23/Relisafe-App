import { Tree } from "react-organizational-chart";
import React, { useEffect, useState, useRef } from "react";
import { removeChartDataHelper } from "../../utils";
import RenderTree from "../../components/FTA/RenderTree";
import "../../App.css";
import { FaEdit, FaTrash, FaEye, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import Api from "../../Api";
import { Button, Form } from "react-bootstrap";
import { Modal } from "antd";
import { Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../../css/PBS.scss";
import Label from "../../components/LabelComponent";
import Select from "react-select";
import { customStyles } from "../../components/core/select";
import { toast } from "react-toastify";
import { useModal } from "../ModalContext";
import { useHistory } from "react-router-dom";
import EventsReportModal from "./EventsReportModal";
import FTAtable from "./FTAtable";
import UnavailabilityReportModal from "./UnavailablityReportModal";
import SteadyStateReportModal from "./SteadyStateReportModal";
import HeaderNavBar from "../HeaderNavBar";
import RenderNode from "./RenderNode";
// Remove ProbabilityContext import

const initialData = {
  id: 1,
  code: "jack_hill",
  description: "CEO",
  gateId: 1,
  children: [
    {
      id: 2,
      code: "john_doe",
      description: "CTO",
      gateId: 2,
      children: [
        {
          id: 3,
          code: "jane_smith",
          description: "Lead Engineer",
          gateId: 3,
        },
        {
          id: 4,
          code: "alex_green",
          description: "Product Manager",
          gateId: 4,
        },
      ],
    },
    {
      id: 5,
      code: "emily_wilson",
      description: "CFO",
      gateId: 5,
      children: [
        {
          id: 6,
          code: "chris_jones",
          description: "Finance Manager",
          gateId: 6,
        },
      ],
    },
  ],
};

export default function FTA(props) {
  const [showGrid, setShowGrid] = useState(false);
  const [currentCalculationMode, setCurrentCalculationMode] = useState("");
  const [calculationMode, setCalculationMode] = useState(null);
  const [treeRenderCalculationMode, setTreeRenderCalculationMode] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [projectId, setProjectId] = useState(props?.location?.state?.projectId);
  const [chartData, setChartData] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLength, setNodeLength] = useState([]);
  const [calcTypes, setCalcTypes] = useState();
  const [productData, setProductData] = useState([]);
  const [currentReportType, setCurrentReportType] = useState("all");

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [eventsData, setEventsData] = useState([]);
  const [gatesData, setGatesData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // LOCAL STATE for probability modal - NO CONTEXT NEEDED
  const [isProbabilityModalOpen, setIsProbabilityModalOpen] = useState(false);
  const [probabilityParams, setProbabilityParams] = useState(null);

  const [isUnavailabilityReportOpen, setIsUnavailabilityReportOpen] =
    useState(false);
  const [isSteadyStateReportOpen, setIsSteadyStateReportOpen] = useState(false);
  const [probabilityCalcData, setProbabilityCalcData] = useState([]);
  const [currentMissionTime, setCurrentMissionTime] = useState("");
  const [isCutSetReportOpen, setIsCutSetReportOpen] = useState(false);
// ... other useState declarations

const [repeatedEvents, setRepeatedEvents] = useState([]);
const [showRepeatedEvents, setShowRepeatedEvents] = useState(false);
  const history = useHistory();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const formikRef = useRef(null);

  const {
    isFTAModalOpen,
    closeFTAModal,
    isPropertiesModal,
    closePropertiesModal,
    isDeleteSucess,
    saveFromFile,
    reloadData,
    openDeleteNode,
    stopTriggerReload,
    onBack, // Add this prop
    showBackButton = false,
    child, // Add this prop
    handleAdd, // Add this prop
  } = useModal();

  const handelDelete = () => {
    openDeleteNode();
  };

  // ===== LOCAL MODAL FUNCTIONS - NO CONTEXT NEEDED =====
  const openProbabilityModal = (params) => {
    setProbabilityParams(params);
    setIsProbabilityModalOpen(true);
  };

  const closeProbabilityModal = () => {
    setIsProbabilityModalOpen(false);
    setProbabilityParams(null);
  };


const calculateUnavailability = (values) => {
  console.log("Calculating unavailability with values:", values);

  // Determine which calculation type was selected from the dropdown
  const calculationType = values?.calcTypes?.value || values?.calcTypes;
  const isUnavailabilityMode = calculationType === "Unavailability at time t Q(t)";
  const isSteadyStateMode = calculationType === "Steady-state mean unavailability Q";
  setCurrentCalculationMode(calculationType);

  // Function to recursively extract and calculate for ALL event nodes
  const extractProbabilityNodes = (node) => {
    const nodes = [];

    if (node) {
      // Check if this node has calculation data (it's an event node)
      // Using isEvent flag to identify event nodes
      if (node.isEvent === true) {
        // Parse parameters with defaults
        const lambda = parseFloat(node.fr) || 0; // Failure Rate λ
        const t = parseFloat(values?.missionTime) || 0; // Mission time t (only used for Q(t) mode)
        const q = parseFloat(node.isP) || 0; // Probability q
        const mttr = parseFloat(node.mttr) || 0; // MTTR (hours)
        const mu = mttr > 0 ? 1 / mttr : 0; // Repair rate μ = 1/MTTR
        const T = parseFloat(node.isT) || 0; // Inspection interval T_i
        const tm = parseFloat(node.eventMissionTime) || t; // Mission time for constant mission type
        const n = 1; // Assuming n=1 for basic event

        let result = 0;
        let formula = "";
        let frequency = 0;

        // Calculate based on event type and selected calculation mode
        switch (node.calcTypes) {
          // #1 Probability (from Table 1, row 1)
          case "Probability":
            if (isUnavailabilityMode) {
              // Q(t) = q
              result = q;
              formula = `Q(t) = q = ${q}`;
            } else if (isSteadyStateMode) {
              // Mean Unavailability Qmean = q
              result = q;
              formula = `Q̄ = q = ${q}`;
            }
            // Frequency w(t) = 0 (as per Table 1)
            frequency = 0;
            formula += ` | w(t) = 0`;
            break;

          // #2 Frequency (from Table 1, row 2)
          case "Frequency":
            if (isUnavailabilityMode) {
              // Q(t) = 0
              result = 0;
              formula = `Q(t) = 0 (Frequency event)`;
            } else if (isSteadyStateMode) {
              // Mean Unavailability Qmean = 0
              result = 0;
              formula = `Q̄ = 0 (Frequency event)`;
            }
            // Frequency w(t) = f (constant frequency) - as per Table 1
            frequency = lambda;
            formula += ` | w(t) = f = ${frequency.toExponential(4)}/h`;
            break;

          // #3 Constant mission time (from Table 1, row 3)
          case "Constant mission time":
            if (isUnavailabilityMode) {
              // Q(t) = 1 - (1-q)^n * exp(-λ*Tm)
              result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * tm);
              formula = `Q(t) = 1-(1-${q})^${n}·exp(-${lambda.toExponential(2)}·${tm}) = ${result.toExponential(4)}`;
            } else if (isSteadyStateMode) {
              // Mean Unavailability Qmean = 1 - (1-q)^n * exp(-λ*Tm)
              result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * tm);
              formula = `Q̄ = 1-(1-${q})^${n}·exp(-${lambda.toExponential(2)}·${tm}) = ${result.toExponential(4)}`;
            }
            // Frequency w(t) = 0 (as per Table 1)
            frequency = 0;
            formula += ` | w(t) = 0`;
            break;

          // #4 Repairable (from Table 1, row 4)
          case "Repairable":
            const lambdaMu = lambda + mu;

            if (isUnavailabilityMode) {
              // Q(t) = q^n·exp(-(λ+μ)t) + (λ/(λ+μ))^n·[1-exp(-(λ+μ)t)]
              if (lambdaMu > 0) {
                const expTerm = Math.exp(-lambdaMu * t);
                result = Math.pow(q, n) * expTerm + Math.pow(lambda / lambdaMu, n) * (1 - expTerm);
              } else {
                result = Math.pow(q, n);
              }
              formula = `Q(t) = ${q}^${n}·e^(-(${lambda.toExponential(2)}+${mu.toExponential(2)})·${t}) + (${lambda.toExponential(2)}/(${lambda.toExponential(2)}+${mu.toExponential(2)}))^${n}[1-e^(-(${lambda.toExponential(2)}+${mu.toExponential(2)})·${t})] = ${result.toExponential(4)}`;
            } else if (isSteadyStateMode) {
              // Mean Unavailability Qmean = λ/(λ+μ)
              if (lambdaMu > 0) {
                result = lambda / lambdaMu;
              } else {
                result = 0;
              }
              formula = `Q̄ = λ/(λ+μ) = ${lambda.toExponential(2)}/(${lambda.toExponential(2)}+${mu.toExponential(2)}) = ${result.toExponential(4)}`;
            }

            // Frequency w(t) = λ^n·(1-Q(t)) - as per Table 1, row 4
            frequency = Math.pow(lambda, n) * (1 - result);
            formula += ` | w(t) = λ^${n}·(1-Q(t)) = ${lambda.toExponential(2)}^${n}·(1-${result.toExponential(4)}) = ${frequency.toExponential(4)}/h`;
            break;

          // #5 Unrepairable (from Table 1, row 5)
          case "Unrepairable":
            if (isUnavailabilityMode) {
              // Q(t) = 1 - (1-q)^n·exp(-λt)
              result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * t);
              formula = `Q(t) = 1-(1-${q})^${n}·e^(-${lambda.toExponential(2)}·${t}) = ${result.toExponential(4)}`;
            } else if (isSteadyStateMode) {
              // Mean Unavailability Qmean = 1 (as per Table 1, row 5)
              result = 1;
              formula = `Q̄ = 1 (Unrepairable element)`;
            }

            // Frequency w(t) = λ^n·(1-Q(t)) - as per Table 1, row 5
            frequency = Math.pow(lambda, n) * (1 - result);
            formula += ` | w(t) = λ^${n}·(1-Q(t)) = ${lambda.toExponential(2)}^${n}·(1-${result.toExponential(4)}) = ${frequency.toExponential(4)}/h`;
            break;

          // #6 Periodical tests (from Table 1, row 6, with Table 2 for Q(t) and Table 3 for Qmean)
        // For Periodical tests case (row 6)
case "Periodical tests":
  const Ti = parseFloat(node.isT) || 0;  // Test interval
  const Tf = parseFloat(node.timeToFirstTest) || 0; // Time to first test
  const n = 1; // Assuming n=1 for basic event
  
  if (isUnavailabilityMode) {
    // Using Table 2 formulas
    if (t < Tf) {
      // Formula #1: t < Tf
      result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * t);
      formula = `Q(t) = 1-(1-${q})^${n}·exp(-${lambda.toExponential(2)}·${t}) [t < Tf] = ${result.toExponential(4)}`;
    } else if (Math.abs(t - (Tf + n * Ti)) < 0.0001) {
      // Formula #2: t = Tf + nTi
      result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * Ti);
      formula = `Q(t) = 1-(1-${q})^${n}·exp(-${lambda.toExponential(2)}·${Ti}) [t = Tf + nTi] = ${result.toExponential(4)}`;
    } else if (t > Tf + n * Ti && t <= Tf + n * Ti + mttr) {
      // Formula #3: Tf + nTi < t <= Tf + nTi + MTTR
      const t1 = t - (Tf + n * Ti); // time since the last test
      const term1 = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * Ti);
      const term2 = Math.pow(1 - q, n) * Math.exp(-lambda * Ti) * 
                    (1 - Math.pow(1 - q, n) * Math.exp(-lambda * t1));
      result = term1 + term2;
      formula = `Q(t) = ${term1.toExponential(4)} + ${term2.toExponential(4)} [Tf + nTi < t <= Tf + nTi + MTTR] = ${result.toExponential(4)}`;
    } else if (t > Tf + n * Ti + mttr && t < Tf + n * Ti + Ti) {
      // Formula #4: Tf + nTi + MTTR < t < Tf + nTi + Ti
      const t1 = t - (Tf + n * Ti); // time since the last test
      result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * t1);
      formula = `Q(t) = 1-(1-${q})^${n}·exp(-${lambda.toExponential(2)}·${t1}) [Tf + nTi + MTTR < t < Tf + nTi + Ti] = ${result.toExponential(4)}`;
    } else {
      result = 0;
      formula = "Q(t) = 0 (No matching condition)";
    }
  } else if (isSteadyStateMode) {
    // Using Table 3 formula for Mean Unavailability
    // Simplified formula often used: Qmean ≈ (λ * Ti)/2 + (λ * MTTR)
    result = (lambda * Ti) / 2 + lambda * mttr;
    formula = `Q̄ ≈ λ·Ti/2 + λ·MTTR = (${lambda.toExponential(2)}·${Ti})/2 + ${lambda.toExponential(2)}·${mttr} = ${result.toExponential(4)} (simplified)`;
  }
  break;

          // #7 Latent (from Table 1, row 7)
          case "Latent":
            if (isUnavailabilityMode) {
              // Q(t) = 1 - (1-q)^t·exp(-λ·Ti)
              result = 1 - Math.pow(1 - q, t) * Math.exp(-lambda * T);
              formula = `Q(t) = 1-(1-${q})^${t}·e^(-${lambda.toExponential(2)}·${T}) = ${result.toExponential(4)}`;
            } else if (isSteadyStateMode) {
              // Mean Unavailability = 1 - (1-q)^t·exp(-λ·Ti)
              result = 1 - Math.pow(1 - q, t) * Math.exp(-lambda * T);
              formula = `Q̄ = 1-(1-${q})^${t}·e^(-${lambda.toExponential(2)}·${T}) = ${result.toExponential(4)}`;
            }

            // Frequency w(t) = λ^t·(1-Q(t)) - as per Table 1, row 7
            frequency = Math.pow(lambda, 1) * (1 - result);
            formula += ` | w(t) = λ·(1-Q(t)) = ${lambda.toExponential(2)}·(1-${result.toExponential(4)}) = ${frequency.toExponential(4)}/h`;
            break;

          // #8 Average probability per mission hour (from Table 1, row 8)
          case "Average probability per mission hour":
            if (isUnavailabilityMode) {
              // Q(t) = 1 - (1-q)^t
              result = 1 - Math.pow(1 - q, t);
              formula = `Q(t) = 1-(1-${q})^${t} = ${result.toExponential(4)}`;
            } else if (isSteadyStateMode) {
              // Mean Unavailability = 1 (as per Table 1, row 8)
              result = 1;
              formula = `Q̄ = 1`;
            }
            // Frequency w(t) = 0 (as per Table 1, row 8)
            frequency = 0;
            formula += ` | w(t) = 0`;
            break;

          // #9 Periodical Tests #2 (from Table 1, row 9)
          case "Periodical Tests #2":
            const Tf2 = node.timeToFirstTest || 0;

            if (isUnavailabilityMode) {
              // Algorithm with different formulas for different cases
              if (t < Tf2) {
                result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * t);
                formula = `Q(t) = 1-(1-${q})^${n}·exp(-${lambda.toExponential(2)}·${t}) [Phase 1] = ${result.toExponential(4)}`;
              } else {
                // For periodic tests after first test
                const cycles = Math.floor((t - Tf2) / T);
                const timeInCycle = (t - Tf2) % T;

                if (timeInCycle < mttr) {
                  // In repair phase
                  result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * (Tf2 + cycles * T));
                  formula = `Q(t) ≈ ${result.toExponential(4)} [Repair phase]`;
                } else {
                  // In operating phase
                  result = 1 - Math.pow(1 - q, n) * Math.exp(-lambda * (Tf2 + cycles * T));
                  formula = `Q(t) ≈ ${result.toExponential(4)} [Operating phase]`;
                }
              }
            } else if (isSteadyStateMode) {
              // Algorithm for mean unavailability (simplified)
              result = (lambda * T) / 2 + lambda * mttr;
              formula = `Q̄ ≈ λ·T/2 + λ·MTTR = (${lambda.toExponential(2)}·${T})/2 + ${lambda.toExponential(2)}·${mttr} = ${result.toExponential(4)} (simplified)`;
            }

            // Frequency w(t) = λ^n·(1-Q(t)) - as per Table 1, row 9
            frequency = Math.pow(lambda, n) * (1 - result);
            formula += ` | w(t) = λ^${n}·(1-Q(t)) = ${lambda.toExponential(2)}^${n}·(1-${result.toExponential(4)}) = ${frequency.toExponential(4)}/h`;
            break;

          // Backward compatibility cases
          case "Evident, P=λ*t":
            result = lambda * t;
            formula = `Q = λ·t = ${lambda.toExponential(2)}·${t} = ${result.toExponential(4)}`;
            frequency = lambda * (1 - result);
            formula += ` | w(t) = λ·(1-Q) = ${frequency.toExponential(4)}/h`;
            break;

          case "Const.mission time, P=λ*tm":
            result = lambda * tm;
            formula = `Q = λ·tm = ${lambda.toExponential(2)}·${tm} = ${result.toExponential(4)}`;
            frequency = 0;
            formula += ` | w(t) = 0`;
            break;

          case "Latent, P=λ*T":
            result = lambda * T;
            formula = `Q = λ·T = ${lambda.toExponential(2)}·${T} = ${result.toExponential(4)}`;
            frequency = lambda * (1 - result);
            formula += ` | w(t) = λ·(1-Q) = ${frequency.toExponential(4)}/h`;
            break;

          case "Latent, P=λ*T/2":
            result = (lambda * T) / 2;
            formula = `Q = λ·T/2 = (${lambda.toExponential(2)}·${T})/2 = ${result.toExponential(4)}`;
            frequency = lambda * (1 - result);
            formula += ` | w(t) = λ·(1-Q) = ${frequency.toExponential(4)}/h`;
            break;

          case "Latent,Life-time, P=1-e^(-λ*T)":
            result = 1 - Math.exp(-lambda * T);
            formula = `Q = 1-e^(-λ·T) = 1-e^(-${lambda.toExponential(2)}·${T}) = ${result.toExponential(4)}`;
            frequency = lambda * (1 - result);
            formula += ` | w(t) = λ·(1-Q) = ${frequency.toExponential(4)}/h`;
            break;

          case "Latent repairable":
            const lambdaMu2 = lambda + mu;
            if (lambdaMu2 > 0) {
              result = (lambda / lambdaMu2) * (1 - Math.exp(-lambdaMu2 * T));
            } else {
              result = 0;
            }
            formula = `Q = (λ/(λ+μ))[1-e^(-(λ+μ)T)] = (${lambda.toExponential(2)}/(${lambda.toExponential(2)}+${mu.toExponential(2)}))[1-e^(-(${lambda.toExponential(2)}+${mu.toExponential(2)})·${T})] = ${result.toExponential(4)}`;
            frequency = lambda * (1 - result);
            formula += ` | w(t) = λ·(1-Q) = ${frequency.toExponential(4)}/h`;
            break;

          default:
            // If calcTypes doesn't match any case, skip this node
            console.log("Unknown calculation type:", node.calcTypes);
            break;
        }

        // Handle NaN or infinite values
        if (isNaN(result) || !isFinite(result)) result = 0;
        if (isNaN(frequency) || !isFinite(frequency)) frequency = 0;

        // Store the node data with all calculated values
        nodes.push({
          id: node.id,
          gateId: node.gateId,
          name: node.name || node.code || `Gate ${node.gateId}`,
          description: node.description || "",
          failureRate: node.fr || "N/A",
          missionTime: t.toString(),
          mttr: node.mttr || "N/A",
          calcType: node.calcTypes || "N/A",
          q: node.isP || "N/A",
          T: node.isT || "N/A",
          timeToFirstTest: node.timeToFirstTest || "0",
          // Store the calculated value based on mode
          calculatedValue: result.toExponential(4),
          // Store appropriate values based on mode
          unavailability: isUnavailabilityMode ? result.toExponential(4) : "N/A",
          steadyState: isSteadyStateMode ? result.toExponential(4) : "N/A",
          frequency: frequency > 0 ? frequency.toExponential(4) : "0",
          formula: formula,
          calculationMode: isUnavailabilityMode ? "Q(t)" : "Q̄",
          rawValue: result,
        });
      }

      // IMPORTANT: Recursively process ALL children nodes
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          nodes.push(...extractProbabilityNodes(child));
        });
      }
    }

    return nodes;
  };

  // Extract and calculate for ALL nodes in the tree
  const calcData = extractProbabilityNodes(chartData);
  console.log("Calculation results for ALL event nodes:", calcData);
  
  // Update state with all calculation results
  setProbabilityCalcData(calcData);

  // Open the appropriate report modal based on selection
  if (isUnavailabilityMode) {
    setCurrentMissionTime(values?.missionTime);
    setIsUnavailabilityReportOpen(true);
  } else if (isSteadyStateMode) {
    setIsSteadyStateReportOpen(true);
  }
};

  const submitProbabilityCalculation = (values) => {
    console.log("Submitting calculation:", values);
    calculateUnavailability(values);
    closeProbabilityModal();
  };

  const detectRepeatedEvents = (treeData) => {
  const lambdaTypeMap = new Map(); // Store lambda+type combinations
  const repeated = [];

  const traverse = (node) => {
    if (node?.isEvent) {
      // Get the lambda/failure rate value and calculation type
      const lambda = node.fr || node.failureRate || "0";
      const calcType = node.calcTypes || "unknown";
      
      // Create a combined key from lambda value and calculation type
      const key = `${lambda}|${calcType}`;
      
      if (lambdaTypeMap.has(key)) {
        // This lambda+type combination has been seen before
        const existingIds = lambdaTypeMap.get(key);
        
        // Mark current node
        if (!repeated.includes(node.gateId)) {
          repeated.push(node.gateId);
        }
        
        // Mark all previous occurrences with same lambda+type
        existingIds.forEach(id => {
          if (!repeated.includes(id)) {
            repeated.push(id);
          }
        });
        
        // Add current node to the list
        existingIds.push(node.gateId);
        lambdaTypeMap.set(key, existingIds);
      } else {
        // First time seeing this lambda+type combination
        lambdaTypeMap.set(key, [node.gateId]);
      }
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child));
    }
  };

  traverse(treeData);
  
  // Log for debugging
  console.log("Lambda+Type Map:", Array.from(lambdaTypeMap.entries()));
  console.log("Found repeated events:", repeated);
  
  return repeated;
};


const handleShowRepeatedEvents = () => {
  if (!chartData) {
    toast.warning("No fault tree data available");
    return;
  }

  // Toggle the show state
  const newShowState = !showRepeatedEvents;
  
  if (newShowState) {
    // Find events with same lambda values
    const repeated = detectRepeatedEvents(chartData);
    setRepeatedEvents(repeated);
    
    if (repeated.length > 0) {
      toast.info(`Found ${repeated.length} event(s) with  lambda values`);
    } else {
      toast.success("No  lambda values found");
    }
  } else {
    // Clear repeated events when turning off
    setRepeatedEvents([]);
  }
  
  setShowRepeatedEvents(newShowState);
};

  useEffect(() => {
  window.showRepeatedEvents = () => {
    handleShowRepeatedEvents();
  };

  return () => {
    delete window.showRepeatedEvents;
  };
}, [chartData, showRepeatedEvents]);

  // const calculateUnavailability = (values) => {
  //   const extractProbabilityNodes = (node) => {
  //     const nodes = [];

  //     if (node) {
  //       const hasFailureData = node.fr || node.calcTypes;

  //       if (hasFailureData) {
  //         let unavailability = 0;

  //         if (values.calcTypes?.value === "Unavailability at time t Q(t)") {
  //           const lambda = parseFloat(node.fr) || 0;
  //           const t = parseFloat(values.missionTime) || 0;
  //           unavailability = 1 - Math.exp(-lambda * t);
  //         } else {
  //           const lambda = parseFloat(node.fr) || 0;
  //           const mttr = parseFloat(node.mttr) || 0;
  //           const mu = mttr > 0 ? 1 / mttr : 0;
  //           unavailability = lambda + mu > 0 ? lambda / (lambda + mu) : 0;
  //         }

  //         nodes.push({
  //           name: node.name || node.code || `Gate ${node.gateId}`,
  //           description: node.description || '',
  //           failureRate: node.fr || 'N/A',
  //           missionTime: values.missionTime || '',
  //           mttr: node.mttr || 'N/A',
  //           unavailability: unavailability.toExponential(4),
  //           steadyStateUnavailability: unavailability.toExponential(4)
  //         });
  //       }

  //       if (node.children && node.children.length > 0) {
  //         node.children.forEach(child => {
  //           nodes.push(...extractProbabilityNodes(child));
  //         });
  //       }
  //     }

  //     return nodes;
  //   };

  //   const calcData = extractProbabilityNodes(chartData);
  //   setProbabilityCalcData(calcData);

  //   if (values.calcTypes?.value === "Unavailability at time t Q(t)") {
  //     setCurrentMissionTime(values.missionTime);
  //     setIsUnavailabilityReportOpen(true);
  //   } else {
  //     setIsSteadyStateReportOpen(true);
  //   }
  // };

  const generateReport = (type = "all") => {
    if (!chartData) {
      toast.warning("No fault tree data available");
      return;
    }

    const extractAllNodes = (node) => {
      const nodes = [];

      if (node) {
        const hasFailureRate =
          node.fr || node.failureRate || node.frValue || node.failureRateValue;
        const isEvent =
          hasFailureRate || node.calcTypes || node.isEvent === true;
        const isGate =
          node.gateType || (node.children && node.children.length > 0);

        const failureRate =
          node.fr ||
          node.failureRate ||
          node.frValue ||
          node.failureRateValue ||
          "N/A";

        const nodeData = {
          id: node.id,
          code: node.code || node.name || `Gate ${node.gateId}`,
          description: node.description || "No description",
          type: isEvent ? "Event" : isGate ? "Gate" : "Unknown",
          failureRate: isEvent ? failureRate : "N/A",
          calcType: node.calcTypes || "N/A",
          gateType: node.gateType || "N/A",
          gateId: node.gateId || "N/A",
          children: node.children || [],
          product: node.product || "N/A",
          childCount: node.children ? node.children.length : 0,
        };

        nodes.push(nodeData);

        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => {
            nodes.push(...extractAllNodes(child));
          });
        }
      }

      return nodes;
    };

    const allNodes = extractAllNodes(chartData);
    const events = allNodes.filter((node) => node.type === "Event");
    const gates = allNodes.filter((node) => node.type === "Gate");

    setEventsData(events);
    setGatesData(gates);
    setCurrentReportType(type);
    setIsReportModalOpen(true);

    toast.success(
      `${type === "events" ? "Events" : type === "gates" ? "Gates" : "Report"} generated successfully`,
    );
  };

  useEffect(() => {
    window.generateFTAReport = (type) => {
      generateReport(type);
    };

    return () => {
      delete window.generateFTAReport;
    };
  }, [generateReport]); // This useEffect references generateReport

  // ===== USE EFFECT FOR PROBABILITY PARAMS =====
  useEffect(() => {
    if (probabilityParams) {
      // calculateUnavailability(probabilityParams);
    }
  }, [probabilityParams]);

  // ===== WINDOW OPEN PROBABILITY MODAL =====
  useEffect(() => {
    window.openProbabilityModal = (params) => {
      openProbabilityModal(params);
    };

    return () => {
      delete window.openProbabilityModal;
    };
  }, []);

  const handleZoomToFit = () => {
    setPanOffset({ x: 0, y: 0 });
    toast.success("Zoomed to fit screen");
  };

  const handleZoomOriginal = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    toast.success("Reset to original size");
  };

  const handleToggleGrid = () => {
    const newShowGrid = !showGrid;
    setShowGrid(newShowGrid);
    toast.success(newShowGrid ? "Grid shown" : "Grid hidden");
  };

  const handleOriginalLayout = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setPanning(false);
    setPanStart({ x: 0, y: 0 });
    toast.success("Original layout restored");
  };

  // ===== GENERATE REPORT FUNCTION - NO HOOKS INSIDE =====

  const handleWheelScroll = (event) => {
    const newZoom = zoomLevel + event.deltaY * -0.001;
    setZoomLevel(Math.min(Math.max(0.1, newZoom), 2));
  };

  // const handleMouseDown = (event) => {
  //   if (event.button === 0) {
  //     setPanning(true);
  //     setPanStart({ x: event.clientX, y: event.clientY });
  //   }
  // };

  const handleMouseDown = (event) => {
    if (event.button === 0) {
      setPanning(true); // setPanStart({ x: event.clientX, y: event.clientY });
      setPanStart({
        x: event.clientX - panOffset.x,
        y: event.clientY - panOffset.y,
      });
    }
  };

  const handleMouseMove = (event) => {
    if (panning) {
      const offsetX = event.clientX - panStart.x;
      const offsetY = event.clientY - panStart.y;
      setPanOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseUp = (event) => {
    if (panning) {
      setPanning(false);
      setPanStart({ x: 0, y: 0 });
    }
  };

  const removeChartData = (id) => {
    setChartData((oldData) => {
      return removeChartDataHelper(oldData, id);
    });
  };

  const addChartNode = (id, newNode) => {
    setChartData((oldData) => {
      const addNodeHelper = (data) => {
        if (!data) return;
        if (data.id === id) {
          return {
            ...data,
            children: [...(data.children || []), newNode],
          };
        }
        return {
          ...data,
          children: data?.children?.map((child) => addNodeHelper(child)),
        };
      };

      return addNodeHelper(oldData);
    });
  };

  const editChartNode = (id, newNode) => {
    setChartData((oldData) => {
      const editNodeHelper = (data) => {
        if (!data) return;
        if (data.id === id) {
          return { ...data, ...newNode };
        }
        return {
          ...data,
          children: data?.children?.map((child) => editNodeHelper(child)),
        };
      };

      return editNodeHelper(oldData);
    });
  };

  const validate = Yup.object().shape({
    name: Yup.string().required("Name is Required"),
    description: Yup.string().required("Description is Required"),
    gateId: Yup.string().required("Gate Id is Required"),
    calcTypes: Yup.object().required("Calc.Types is Required"),
    missionTime: Yup.mixed().when("calcTypes", {
      is: (calcTypes) => calcTypes?.value === "Unavailability at time t Q(t)",
      then: Yup.string().required("Mission Time t is Required"),
      otherwise: Yup.string().nullable(), // Changed from Yup.object().nullable()
    }),
  });
  const parentSubmit = (values, { resetForm }) => {
    const companyId = localStorage.getItem("companyId");
    Api.post("/api/v1/FTA/create/parent", {
      gateType: "OR",
      name: values.name,
      description: values.description,
      gateId: values.gateId,
      calcTypes: values.calcTypes.value,
      missionTime: values.missionTime,
      projectId: projectId,
      companyId: companyId,
    }).then((res) => {
      getFTAData();
      setIsModalOpen(false);
      resetForm({ values: "" });
      handleCancel();
      setCalcTypes("");
      toast("Created", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "success",
      });
    });
  };

  const updateProperties = (values, { resetForm }) => {
    Api.patch(`/api/v1/FTA/update/property/${chartData?.parentId}`, {
      productId: chartData?.id,
      name: values.name,
      description: values.description,
      calcTypes: values.calcTypes.value,
      missionTime: values.missionTime,
      gateType: chartData.gateType,
    }).then((res) => {
      getFTAData();
      setIsModalOpen(false);
      resetForm({ values: "" });
      handleCancel();
      setCalcTypes("");
      toast("Updated Successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "success",
      });
    });
  };

  const getFTAData = () => {
    setLoading(true);
    Api.get(`/api/v1/FTA/get/${projectId}`)
      .then((res) => {
        const allTreeData = res?.data?.nodeData || [];
        setTrees(allTreeData);
        setNodeLength(allTreeData);

        if (viewMode === "chart" && allTreeData.length > 0 && selectedTreeId) {
          const treeToShow =
            allTreeData.find(
              (tree) =>
                tree._id === selectedTreeId || tree.id === selectedTreeId,
            ) || allTreeData[0];
          setChartData(treeToShow.treeStructure || {});
          if (treeToShow.treeStructure?.parentId) {
            getFullFTAdata(treeToShow.treeStructure.parentId);
          }
        }

        setLoading(false);
        stopTriggerReload();
      })
      .catch((error) => {
        console.error("Error fetching trees:", error);
        toast.error("Failed to load trees");
        setLoading(false);
      });
  };

  const handleDeleteTree = (tree) => {
    if (!tree) {
      toast.error("Invalid tree ID");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this tree and all its nodes?",
      )
    ) {
      try {
        Api.delete(`/api/v1/FTA/delete/${tree?.projectId}/${tree?.id}`)
          .then((res) => {
            toast.success("Tree deleted successfully");

            if (selectedTreeId === tree?.id) {
              handleBackToTable();
            }

            getFTAData();
          })
          .catch((error) => {
            console.error("Delete error:", error);
          });
      } catch (error) {
        console.error("Unexpected error during tree deletion:", error);
        toast.error("An unexpected error occurred while deleting the tree.");
      }
    }
  };

  const handleViewTree = (tree) => {
    setChartData(tree.treeStructure || {});
    setSelectedTreeId(tree.id || tree._id);
    setViewMode("chart");

    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setPanning(false);

    if (tree.treeStructure?.parentId) {
      getFullFTAdata(tree.treeStructure.parentId);
    }

    toast.success(`Viewing tree: ${tree.name}`);
  };

  const handleCreateNewTree = () => {
    setIsModalOpen(true);
    // :white_check_mark: Reset position
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    setPanning(false);
  };

  const handleBackToTable = () => {
    setViewMode("table");
    setChartData([]);
    setSelectedTreeId(null);
  };

  const handleCancel = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    setIsModalOpen(false);
    closeFTAModal();
    closePropertiesModal();
  };

  if (isDeleteSucess) {
    getFTAData();
  }

  const getTreeProduct = () => {
    const userId = localStorage.getItem("userId");
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        setProductData(treeData);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    if (projectId) {
      getFTAData();
      getTreeProduct();
    }
  }, [projectId]);

  useEffect(() => {
    if (reloadData && projectId) {
      getFTAData();
      stopTriggerReload();
    }
  }, [reloadData, projectId, stopTriggerReload]);

  useEffect(() => {
    window.triggerFTAUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    return () => {
      delete window.triggerFTAUpdate;
    };
  }, []);

  useEffect(() => {
    if (projectId) {
      getFTAData();
    }
  }, [projectId, refreshTrigger]);

  const getFullFTAdata = (id) => {
    if (id) {
      Api.get(`/api/v1/FTA/get/tree/${id}`).then((res) => {
        const data = res?.data?.nodeData[0];
        console.log(data, "from index");
        setCurrentCalculationMode(data?.treeStructure?.calcTypes || "")
        saveFromFile(data);
      });
    } else {
      saveFromFile(null);
    }
  };

  const isSteadyStateMode = (values) => {
    console.log(values,'from index od isSteady Ste')
    return calculationMode === "Steady-state mean unavailability Q";
  };

  // console.log(treeRenderCalculationMode, "calculation mode in index");

  return (
    <div>
 {viewMode === "chart" && (
      <HeaderNavBar
        // style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
        selectedComponent="FTA"
        onZoomToFit={handleZoomToFit}
        onZoomOriginal={handleZoomOriginal}
        onToggleGrid={handleToggleGrid}
        onOriginalLayout={handleOriginalLayout}
        isTreeView={viewMode === "chart"}
        onBackToTable={handleBackToTable}
        setViewMode={setViewMode}
        setChartData={setChartData}
        selectedTreeId={selectedTreeId}
       
        
      />
    )}
      {viewMode === "table" ? (
        <FTAtable
          trees={trees}
          loading={loading}
          onViewTree={handleViewTree}
          onCreateNewTree={handleCreateNewTree}
          projectId={projectId}
          onBack={() => window.history.back()} // or your custom back function
          showBackButton={true}
        />
      ) : nodeLength.length > 0 && chartData ? (
        <div>
          {/* <div
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "75px",
              zIndex: 3,
            }}
          >
            <Button
              variant="outline-secondary"
              onClick={handleBackToTable}
              title="Back to Trees List"
            >
              <FaArrowLeft />
            </Button>
          </div> */}
          
          <div
            className="org-chart-container"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              display: "flex",
              justifyContent: "center",
              width: "100%",
              transformOrigin: "center center",
              height: "10px",
              padding: "20px",
              zIndex: 1,
              position: "relative",
            }}
            onWheel={handleWheelScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div
              className="tree-wrapper"
              style={{
                position: "absolute",
                top: "0",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "20px",
                zIndex: 7,
              }}
            >
              <div style={{ display: "flex",
               justifyContent: "center",
                marginBottom: "10px",
                 marginLeft: "9px", 
              marginTop: "30px",
 }}>
                   <RenderNode
                        // node={data}
                        // parNod={parNod}
                    handleRemove={removeChartData}
                  handleAdd={addChartNode}
                   handleEdit={editChartNode}
                         node={chartData}
                        projectId={projectId}
                        getFTAData={getFTAData}
                        productData={productData}
                        selectedNodeId={selectedNodeId} 
                        setSelectedNodeId={setSelectedNodeId} 
                        calculationMode={calculationMode} 
                        setCurrentCalculationMode={setCurrentCalculationMode}
                        showRepeatedEvents={showRepeatedEvents}
                        repeatedEvents={repeatedEvents}
                      />
              </div>
              <Tree
                lineWidth={"2px"}
                lineColor={"green"}
                lineBorderRadius={"10px"}
                className="org-chart-container"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {chartData?.children?.map((child, index) => (
                  <RenderTree
                    key={index}
                    data={child}
                    handleRemove={removeChartData}
                  handleAdd={addChartNode}
                  handleEdit={editChartNode}
                  projectId={projectId}
                  getFTAData={getFTAData}
                  productData={productData}
                  selectedNodeId={selectedNodeId}
                  setSelectedNodeId={setSelectedNodeId}
                  calculationResults={probabilityCalcData}
                  calculationMode={currentCalculationMode}
                  setCurrentCalculationMode={setCurrentCalculationMode}
                  treeRenderCalculationMode={treeRenderCalculationMode}
                  repeatedEvents={repeatedEvents}        // ADD THIS LINE
  showRepeatedEvents={showRepeatedEvents} // ADD THIS LINE
                />
                ))}
              </Tree>


            </div>
          </div>
        </div>
      ) : (
        <div
          style={{ height: "100vh", display: "flex", justifyContent: "center" }}
        >
          <div style={{ paddingTop: "90px" }}>
            <Button
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: "#00a9c9",
                border: "0px",
                color: "#fff",
                height: "35px",
                width: "150px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              + Create New
            </Button>
          </div>
        </div>
      )}

      {/* LOCAL PROBABILITY MODAL - NO CONTEXT NEEDED */}
      <Modal
        title={
          <p style={{ margin: "0px", color: "#00a9c9", width: "500px" }}>
            Calculation Parameter
          </p>
        }
        open={isProbabilityModalOpen}
        footer={null}
        onCancel={closeProbabilityModal}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: chartData?.name || "",
            description: chartData?.description || "",
            calcTypes: chartData?.calcTypes
              ? { label: chartData?.calcTypes, value: chartData?.calcTypes }
              : "",
            missionTime: chartData?.missionTime || "",
          }}
          onSubmit={(values) => {
            submitProbabilityCalculation(values);
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required("Name is Required"),
            description: Yup.string().required("Description is Required"),
            calcTypes: Yup.object().required("Calc.Types is Required"),
            missionTime: Yup.string().when("calcTypes", {
              is: (calcTypes) =>
                calcTypes?.value === "Unavailability at time t Q(t)",
              then: Yup.string().required("Mission time t is required"),
            }),
          })}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            handleBlur,
            setFieldValue,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-2">
                <Label notify={true}>Name</Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={values.name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <ErrorMessage
                  className="error text-danger"
                  component="span"
                  name="name"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Label notify={true}>Description</Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={values.description}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <ErrorMessage
                  className="error text-danger"
                  component="span"
                  name="description"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Label notify={true}>Calc.Types</Label>
                <Select
                  styles={customStyles}
                  name="calcTypes"
                  value={values.calcTypes}
                  onBlur={handleBlur}
                  onChange={(e) => setFieldValue("calcTypes", e)}
                  options={[
                    {
                      value: "Unavailability at time t Q(t)",
                      label: "Unavailability at time t Q(t)",
                    },
                    {
                      value: "Steady-state mean unavailability Q",
                      label: "Steady-state mean unavailability Q",
                    },
                  ]}
                />
                <ErrorMessage
                  className="error text-danger"
                  component="span"
                  name="calcTypes"
                />
              </Form.Group>

              {values.calcTypes?.value === "Unavailability at time t Q(t)" && (
                <Form.Group className="mb-2">
                  <Label notify={true}>Mission time t</Label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Form.Control
                      type="text"
                      name="missionTime"
                      placeholder="Mission time t"
                      value={values.missionTime}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      style={{ width: "80%" }}
                    />
                    <p
                      style={{
                        margin: "0px",
                        fontWeight: "bold",
                        marginLeft: "20px",
                      }}
                    >
                      (hours)
                    </p>
                  </div>
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="missionTime"
                  />
                </Form.Group>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Button
                  className="me-2"
                  variant="outline-secondary"
                  onClick={closeProbabilityModal}
                >
                  Cancel
                </Button>
                <Button type="submit">Calculate</Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      <EventsReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        eventsData={eventsData}
        gatesData={gatesData}
        //  onGenerateReport={generateReport}
        reportType={currentReportType}
      />

      <UnavailabilityReportModal
        isOpen={isUnavailabilityReportOpen}
        onClose={() => setIsUnavailabilityReportOpen(false)}
        calculationData={probabilityCalcData}
        missionTime={currentMissionTime}
      />

      <SteadyStateReportModal
        isOpen={isSteadyStateReportOpen}
        onClose={() => setIsSteadyStateReportOpen(false)}
        calculationData={probabilityCalcData}
      />

      <Modal
        title={
          <p style={{ margin: "0px", color: "#00a9c9", width: "500px" }}>
            Fault Tree Properties
          </p>
        }
        open={
          isModalOpen
            ? isModalOpen
            : isFTAModalOpen
              ? isFTAModalOpen
              : isPropertiesModal && nodeLength.length > 0
                ? isPropertiesModal
                : null
        }
        footer={null}
        onCancel={handleCancel}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: isPropertiesModal ? chartData?.name : "",
            description: isPropertiesModal ? chartData?.description : "",
            calcTypes: isPropertiesModal
              ? { label: chartData?.calcTypes, value: chartData?.calcTypes }
              : "",
            missionTime: isPropertiesModal ? chartData?.missionTime : "",
            gateId: 1,
          }}
          onSubmit={isPropertiesModal ? updateProperties : parentSubmit}
          validationSchema={validate}
          innerRef={formikRef}
        >
          {(formik) => {
            const {
              values,
              handleChange,
              handleSubmit,
              handleBlur,
              setFieldValue,
            } = formik;
            return (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Label notify={true}>Name</Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={values.name}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="name"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Description</Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={values.description}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="description"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Label notify={true}>Calc.Types</Label>
                  <Select
                    styles={customStyles}
                    name="calcTypes"
                    type="select"
                    value={values.calcTypes}
                    onBlur={handleBlur}
                    onChange={(e) => {
                      setFieldValue("calcTypes", e);
                      setCalcTypes(e.value);
                    }}
                    options={[
                      {
                        value: "Unavailability at time t Q(t)",
                        label: "Unavailability at time t Q(t)",
                      },
                      {
                        value: "Steady-state mean unavailability Q",
                        label: "Steady-state mean unavailability Q",
                      },
                    ]}
                  />
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="calcTypes"
                  />
                </Form.Group>
                {values.calcTypes?.value ===
                  "Unavailability at time t Q(t)" && (
                  <Form.Group className="mb-2">
                    <Label notify={true}>Mission time t</Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        name="missionTime"
                        placeholder="Mission time t"
                        value={values.missionTime}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        style={{ width: "80%" }}
                      />
                      <p
                        style={{
                          margin: "0px",
                          fontWeight: "bold",
                          marginLeft: "20px",
                        }}
                      >
                        ( hours)
                      </p>
                    </div>
                    <ErrorMessage
                      className="error text-danger"
                      component="span"
                      name="missionTime"
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-2">
                  <Label notify={true}>Gate Id</Label>
                  <Form.Control
                    disabled={true}
                    type="text"
                    name="gateId"
                    placeholder="Gate Id"
                    value={values.gateId}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <ErrorMessage
                    className="error text-danger"
                    component="span"
                    name="gateId"
                  />
                </Form.Group>
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    className=" me-2"
                    variant="outline-secondary"
                    type="reset"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isPropertiesModal ? "Save Changes" : "Create"}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </div>
  );
}
