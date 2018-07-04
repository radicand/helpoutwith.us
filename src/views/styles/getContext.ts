import { create } from 'jss';
import { createMuiTheme, jssPreset } from '@material-ui/core/styles';
import { SheetsRegistry } from 'react-jss/lib/jss';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#757de8',
      main: '#3f51b5',
      dark: '#002984',
      contrastText: '#fff',
    },
    secondary: {
      light: '#aab6fe',
      main: '#7986cb',
      dark: '#49599a',
      contrastText: '#000',
    },
  },
});

// Configure JSS
const jss = create(jssPreset());

function createContext() {
  return {
    jss,
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    sheetsManager: new Map(),
    // This is needed in order to inject the critical CSS.
    sheetsRegistry: new SheetsRegistry(),
  };
}

export default function getContext() {
  return createContext();
}
