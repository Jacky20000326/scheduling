import {
  Link,
  Navigate,
  createRoute,
  createRouter,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { SchedulingPage } from "./App";
import { Login } from "./components/Login/Login";

const RootLayout = () => <Outlet />;

const NotFoundScreen = () => (
  <div style={{ padding: "32px" }}>
    <h1 style={{ marginBottom: "12px" }}>找不到頁面</h1>
    <p style={{ marginBottom: "16px" }}>
      您所訪問的頁面不存在，請確認路徑是否正確。
    </p>
    <Link to="/login" style={{ color: "#4f46e5", fontWeight: 600 }}>
      返回登入頁
    </Link>
  </div>
);

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/login" />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const schedulingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scheduling",
  component: SchedulingPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundScreen,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  schedulingRoute,
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
