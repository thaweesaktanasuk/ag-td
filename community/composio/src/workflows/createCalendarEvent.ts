import { step, log } from "@restackio/ai/workflow";
import * as functions from "../functions";

export async function createCalendarEventWorkflow({
  entityId,
  calendarInstruction,
}: {
  entityId: string;
  calendarInstruction: string;
}) {
  const connection = await step<typeof functions>({
    taskQueue: "composio",
  }).initiateConnection({
    entityId,
    appName: 'googlecalendar',
  });

  if (!connection.authenticated) {
    log.info(
      `Follow the link to authenticate with google calendar ${connection.redirectUrl}`
    );
    return connection;
  }

  const calendarEvent = await step<typeof functions>({
    taskQueue: "composio",
  }).createCalendarEvent({
    entityId,
    calendarInstruction,
  });

  return calendarEvent;
}
