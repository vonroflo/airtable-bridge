"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const Sidebar_1 = __importDefault(require("./components/layout/Sidebar"));
const Header_1 = __importDefault(require("./components/layout/Header"));
const Overview_1 = __importDefault(require("./pages/Overview"));
const BasesManagement_1 = __importDefault(require("./pages/BasesManagement"));
const QueueMonitor_1 = __importDefault(require("./pages/QueueMonitor"));
const SyncStatus_1 = __importDefault(require("./pages/SyncStatus"));
const ApiMetrics_1 = __importDefault(require("./pages/ApiMetrics"));
const StorageManagement_1 = __importDefault(require("./pages/StorageManagement"));
const AlertsLogs_1 = __importDefault(require("./pages/AlertsLogs"));
const Settings_1 = __importDefault(require("./pages/Settings"));
function App() {
    const [sidebarCollapsed, setSidebarCollapsed] = (0, react_1.useState)(false);
    const [darkMode, setDarkMode] = (0, react_1.useState)(false);
    return (<div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex bg-gray-50 dark:bg-gray-950">
        <Sidebar_1.default collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}/>
        
        <div className="flex-1 flex flex-col min-h-screen">
          <Header_1.default darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)}/>
          
          <main className="flex-1 p-6 overflow-auto custom-scrollbar">
            <react_router_dom_1.Routes>
              <react_router_dom_1.Route path="/" element={<Overview_1.default />}/>
              <react_router_dom_1.Route path="/bases" element={<BasesManagement_1.default />}/>
              <react_router_dom_1.Route path="/queue" element={<QueueMonitor_1.default />}/>
              <react_router_dom_1.Route path="/sync" element={<SyncStatus_1.default />}/>
              <react_router_dom_1.Route path="/metrics" element={<ApiMetrics_1.default />}/>
              <react_router_dom_1.Route path="/storage" element={<StorageManagement_1.default />}/>
              <react_router_dom_1.Route path="/alerts" element={<AlertsLogs_1.default />}/>
              <react_router_dom_1.Route path="/settings" element={<Settings_1.default />}/>
            </react_router_dom_1.Routes>
          </main>
        </div>
      </div>
    </div>);
}
exports.default = App;
//# sourceMappingURL=App.js.map