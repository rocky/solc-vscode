import {
    Diagnostic,
    DiagnosticSeverity,
    Position,
    Range
} from "vscode";

export interface SolcError {
    sourceLocation: {
        file: string;
        start: number;
        end: number;
    };
    type: string;
    component: string;
    severity: "error" | "warning";
    message: string;
    formattedMessage: string;
}

export function solcErrToDiagnostic(error: SolcError, maxLine: number): Diagnostic {
  const { message, formattedMessage, severity, sourceLocation } = error;

  /* When no poisition is given we will use the _end_ of the file.
     Using the beginning of the file is confusing since it refers to something,
     For example, there might be "pragma" at the beginning of the file.
     In contract the end of the file I think is less ambiguous.
  */
  let line = maxLine;
  let column = 0;
  let columnEnd = 0;

  if (sourceLocation) {
    const errorSegments = formattedMessage.split(":");
    line = parseInt(errorSegments[1], 10) - 1;
    column = parseInt(errorSegments[2], 10) - 1;
    columnEnd = column + (sourceLocation.end - sourceLocation.start);
  }

  return {
    message,
    range: new Range(
      new Position(line, column),
      new Position(line, columnEnd)
    ),
    source: "solc",
    severity: getDiagnosticSeverity(severity)
  };
}

function getDiagnosticSeverity(severity: "error" | "warning"): DiagnosticSeverity {
    switch (severity) {
        case "error":
            return DiagnosticSeverity.Error;
        case "warning":
            return DiagnosticSeverity.Warning;
        default:
            return DiagnosticSeverity.Error;
    }
}
