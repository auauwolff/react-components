import { makeStyles } from '@material-ui/core/styles';
import { IMikeTheme } from '../ThemeProvider/types';

const useCalendarItemStyles = makeStyles<IMikeTheme>((theme) => ({
  button: {
    backgroundColor: theme.palette.mediumGrey.light,
    borderRadius: 4,
    color: theme.palette.primary.main,
    cursor: 'pointer',
    minWidth: 42,
    margin: 2,
    padding: '0px 7px',
    textAlign: 'center',
    flexGrow: 1,
    flex: 'none',
    '&:hover': {
      backgroundColor: theme.palette.mediumGrey.main,
    },
  },
  active: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
  },
  disabled: {
    backgroundColor: theme.palette.lightGrey.main,
    color: theme.palette.mediumGrey.dark,
    cursor: 'default',
    '&:hover': {
      backgroundColor: theme.palette.lightGrey.main,
      color: theme.palette.mediumGrey.dark,
    },
  },
  semiActive: {
    backgroundColor: theme.palette.mediumGrey.main,
  },
}));

export default useCalendarItemStyles;
