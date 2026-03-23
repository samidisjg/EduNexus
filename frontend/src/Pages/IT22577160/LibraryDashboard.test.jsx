import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LibraryDashboard from "./LibraryDashboard";
import libraryService from "../../services/library.service";

vi.mock("../../services/library.service", () => ({
  default: {
    getAllBooks: vi.fn(),
    getAllBorrowings: vi.fn(),
  },
}));

vi.mock("../../components/IT22577160/LibraryOverviewCards", () => ({
  default: () => <div>overview cards</div>,
}));
vi.mock("../../components/IT22577160/LibraryBooksPanel", () => ({
  default: () => <div>books panel</div>,
}));
vi.mock("../../components/IT22577160/LibraryBorrowingsPanel", () => ({
  default: () => <div>borrowings panel</div>,
}));

const store = configureStore({
  reducer: {
    user: () => ({ currentUser: { role: "ADMIN", userName: "Sam", userEmail: "sam@example.com" } }),
    theme: () => ({ theme: "light" }),
  },
});

describe("LibraryDashboard", () => {
  it("loads books and staff borrowings on mount", async () => {
    libraryService.getAllBooks.mockResolvedValue([]);
    libraryService.getAllBorrowings.mockResolvedValue([]);

    render(
      <Provider store={store}>
        <LibraryDashboard />
      </Provider>
    );

    expect(screen.getByText(/library operations dashboard/i)).toBeInTheDocument();
    await waitFor(() => expect(libraryService.getAllBooks).toHaveBeenCalled());
    await waitFor(() => expect(libraryService.getAllBorrowings).toHaveBeenCalled());
  });
});
