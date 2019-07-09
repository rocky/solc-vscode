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

export function solcErrToDiagnostic(error: SolcError): Diagnostic {
  const { message, formattedMessage, severity, sourceLocation } = error;
  const errorSegments = formattedMessage.split(":");
  const line = parseInt(errorSegments[1], 10) - 1;
  const column = parseInt(errorSegments[2], 10) - 1;
  const columnEnd = column + (sourceLocation.end - sourceLocation.start);

  return {
    message,
      range: new Range(
        new Position(line, column),
        new Position(line, columnEnd)
      ),
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
