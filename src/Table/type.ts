interface DefaultTableProps {
  error: boolean;
  loading: boolean;
  tableHeaders: TableHeaders[];
  data: TableData[];
  searchItems: (item: any) => void;
}

interface TableHeaders {
  Header: string;
  accessor: string;
}

interface TableData {
  id: string;
  name: string;
  email?: string;
  userGroups?: string[];
  users?: string[];
  metadata?: any;
}
