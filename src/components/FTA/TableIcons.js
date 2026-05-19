import React from 'react';
import { forwardRef } from 'react';

// Simple text-based icons as fallback
const TableIcons = {
  Add: forwardRef((props, ref) => <span {...props} ref={ref}>+ Add</span>),
  Check: forwardRef((props, ref) => <span {...props} ref={ref}>✓</span>),
  Clear: forwardRef((props, ref) => <span {...props} ref={ref}>✕</span>),
  Delete: forwardRef((props, ref) => <span {...props} ref={ref}>🗑</span>),
  DetailPanel: forwardRef((props, ref) => <span {...props} ref={ref}>▶</span>),
  Edit: forwardRef((props, ref) => <span {...props} ref={ref}>✎</span>),
  Export: forwardRef((props, ref) => <span {...props} ref={ref}>📊</span>),
  Filter: forwardRef((props, ref) => <span {...props} ref={ref}>🔍</span>),
  FirstPage: forwardRef((props, ref) => <span {...props} ref={ref}>⏮</span>),
  LastPage: forwardRef((props, ref) => <span {...props} ref={ref}>⏭</span>),
  NextPage: forwardRef((props, ref) => <span {...props} ref={ref}>▶</span>),
  PreviousPage: forwardRef((props, ref) => <span {...props} ref={ref}>◀</span>),
  ResetSearch: forwardRef((props, ref) => <span {...props} ref={ref}>✕</span>),
  Search: forwardRef((props, ref) => <span {...props} ref={ref}>🔍</span>),
  SortArrow: forwardRef((props, ref) => <span {...props} ref={ref}>↑</span>),
  ThirdStateCheck: forwardRef((props, ref) => <span {...props} ref={ref}>-</span>),
  ViewColumn: forwardRef((props, ref) => <span {...props} ref={ref}>👁</span>)
};

export default TableIcons;