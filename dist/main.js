"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const react_query_1 = require("@tanstack/react-query");
const react_router_dom_1 = require("react-router-dom");
const App_tsx_1 = __importDefault(require("./App.tsx"));
require("./index.css");
const queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000, // 30 seconds
            refetchInterval: 5000, // 5 seconds for real-time updates
            retry: 3,
            refetchOnWindowFocus: false,
        },
    },
});
client_1.default.createRoot(document.getElementById('root')).render(<react_1.default.StrictMode>
    <react_query_1.QueryClientProvider client={queryClient}>
      <react_router_dom_1.BrowserRouter>
        <App_tsx_1.default />
      </react_router_dom_1.BrowserRouter>
    </react_query_1.QueryClientProvider>
  </react_1.default.StrictMode>);
//# sourceMappingURL=main.js.map