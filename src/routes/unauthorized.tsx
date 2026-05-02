import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
    validateSearch: (search) => ({
        redirect: (search.redirect as string) || "/",
        reason: (search.reason as string) || "insufficient_permissions",
    }),
    component: UnauthorizedPage,
});

function UnauthorizedPage() {
    const { redirect, reason } = Route.useSearch();
    const { auth } = Route.useRouteContext();

    const reasonMessages = {
        insufficient_role:
            "You do not have the required role to access this page.",
        insufficient_permissions:
            "You do not have the required permissions to access this page.",
        default: "You are not authorized to access this page.",
    };

    const message =
        reasonMessages[reason as keyof typeof reasonMessages] ||
        reasonMessages.default;

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Access Denied
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="mb-6 text-sm text-gray-500">
                    <p>
                        <strong>Your roles:</strong> {auth.user?.role || "None"}
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/"
                        className="block w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors"
                    >
                        Go to Homepage
                    </Link>

                    <Link
                        to={redirect}
                        className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
}
