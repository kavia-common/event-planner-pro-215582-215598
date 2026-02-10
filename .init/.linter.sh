#!/bin/bash
cd /home/kavia/workspace/code-generation/event-planner-pro-215582-215598/event_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

