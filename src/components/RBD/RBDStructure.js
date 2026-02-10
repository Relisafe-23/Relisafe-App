import React, { useState, useEffect } from "react";
import Api from "../../Api";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Container,
  Chip,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";

const RBDStructure = ({ props }) => {
  const [rbds, setRbds] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const projectId = id || props?.match?.params?.id;

  useEffect(() => {
    if (!projectId) return;
    fetchRBDs();
  }, [projectId]);

  const fetchRBDs = () => {
    setLoading(true);

    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");

    Api.get("/api/v1/productTreeStructure/product/list", {
      params: {
        projectId,
        userId,
        token: sessionId,
      },
    })
      .then((res) => {
        const data = res?.data?.data || [];

        // Parent RBDs (1,2,3...)
        const parents = data.filter(
          item => item?.indexCount && !item.indexCount.includes(".")
        );

        // Child blocks (1.1,1.2...)
        const children = data.filter(
          item => item?.indexCount && item.indexCount.includes(".")
        );

        // Build RBD list with block count
        const rbdList = parents.map(parent => {
          const blockCount = children.filter(child =>
            child.indexCount.startsWith(parent.indexCount + ".")
          ).length;

          return {
            id: parent.id || parent.partNumber,
            label: parent.productName,
            indexCount: parent.indexCount,
            partNumber: parent.partNumber,
            MTBF: parent.MTBF,
            blockCount,
          };
        });

        // Sort RBDs numerically
        rbdList.sort((a, b) =>
          parseInt(a.indexCount, 10) - parseInt(b.indexCount, 10)
        );

        setRbds(rbdList);
      })
      .catch((err) => {
        console.error("Error loading RBDs", err);
      })
      .finally(() => setLoading(false));
  };

  const handleView = (rbd) => {
    console.log("View RBD:", rbd);
    // history.push(`/rbd/view/${rbd.indexCount}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          RBD Structures
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          List of Reliability Block Diagrams (RBDs)
        </Typography>

        {rbds.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No RBDs found
            </Typography>
          </Paper>
        ) : (
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              {rbds.map((rbd, index) => (
                <Box
                  key={rbd.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 3,
                    borderBottom:
                      index < rbds.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "grey.50" },
                  }}
                >
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Chip
                        label={rbd.indexCount}
                        color="primary"
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          minWidth: 50,
                        }}
                      />

                      <Typography variant="h6" fontWeight={600}>
                        {rbd.label}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        Part:
                      </Typography>

                      <Typography
                        component="code"
                        sx={{
                          fontFamily: "monospace",
                          bgcolor: "grey.100",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {rbd.partNumber}
                      </Typography>

                      <Chip
                        label={`Blocks: ${rbd.blockCount}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => handleView(rbd)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      minWidth: 120,
                    }}
                  >
                    View
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default RBDStructure;
