import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionProvider } from "../motion/MotionProvider";
import { router } from "./router";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionProvider>
        <RouterProvider router={router} />
      </MotionProvider>
    </QueryClientProvider>
  );
}
