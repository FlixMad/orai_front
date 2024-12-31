import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import Layout from "./components/layout/Layout";
import GlobalStyles from "./styles/globalStyles";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <Layout>
          <div>
            {/* <h1>Hello World</h1> */}
            {/* 여기에 라우트 설정이 들어갈 예정입니다 */}
          </div>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
