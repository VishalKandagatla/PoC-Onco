import React from "react";

const App = () => {
  return React.createElement(
    "div",
    { className: "min-h-screen bg-background text-foreground" },
    React.createElement(
      "div",
      { className: "container mx-auto px-4 py-8" },
      React.createElement("h1", { className: "text-4xl font-bold text-center" }, "Welcome"),
      React.createElement(
        "p",
        { className: "text-center text-muted-foreground mt-4" },
        "Your application is ready to build."
      )
    )
  );
};

export default App;