import React, { useState, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    try {
        if (hasError) {
            throw new Error("Component failed to render");
        }
        return <>{children}</>;
    } catch (error) {
        console.error("Error caught by ErrorBoundary:", error);
        return (
            <div className="p-4 text-red-500 bg-red-100 border border-red-400 rounded-lg">
                Something went wrong!
            </div>
        );
    }
};

export default ErrorBoundary;
