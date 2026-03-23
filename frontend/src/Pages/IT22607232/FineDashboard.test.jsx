import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import FineDashboard from "./FineDashboard";
import fineService from "../../services/fine.service";

vi.mock("../../services/fine.service", () => ({
  default: {
    getAllFines: vi.fn(),
    getPaymentsByFineId: vi.fn(),
  },
}));

vi.mock("../../components/IT22607232/FineCommandCenter", () => ({
  default: () => <div>fine command center</div>,
}));
vi.mock("../../components/IT22607232/FineQueueBoard", () => ({
  default: () => <div>fine queue board</div>,
}));
vi.mock("../../components/IT22607232/FineSettlementPanel", () => ({
  default: () => <div>fine settlement panel</div>,
}));

const store = configureStore({
  reducer: {
    user: () => ({ currentUser: { role: "ADMIN" } }),
  },
});

describe("FineDashboard", () => {
  it("loads the fine ledger for staff users", async () => {
    fineService.getAllFines.mockResolvedValue([]);

    render(
      <Provider store={store}>
        <FineDashboard />
      </Provider>
    );

    expect(screen.getByText(/review fines and record payments/i)).toBeInTheDocument();
    await waitFor(() => expect(fineService.getAllFines).toHaveBeenCalled());
  });
});
