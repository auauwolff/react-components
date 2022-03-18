import { ReactChild, CSSProperties, ReactNode } from 'react';

export interface Props {
  title: string;
  description?: string;
  disabled?: boolean;
  children: ReactChild | ReactChild[];
  headerChildren?: ReactChild | ReactChild[];
  style?: CSSProperties;
  isLoading?: boolean;
  actions: ReactNode;
}
