"use strict";

const counterSteps = {
  normal: [
    ["Start at zero", "State: 0\nCounter mailbox: []\nCaller mailbox: []", "start/0 creates a process running loop(0)."],
    ["Send the first request", "State: 0\nCounter mailbox: [{add, Caller, Ref1, 3}]\nCaller: waiting for Ref1", "The caller sends its PID, a fresh reference, and the amount. Ref1 is a label for that reference."],
    ["Handle the request", "State: 3\nCounter mailbox: []\nCaller mailbox: [{Ref1, 3}]", "The integer guard succeeds. The counter computes 0 + 3, replies, and continues as loop(3)."],
    ["Return the first result", "State: 3\nCounter mailbox: []\nCaller mailbox: []\nadd/2 returns: 3", "The caller takes the reply matching Ref1."],
    ["Send the next request", "State: 3\nCounter mailbox: [{add, Caller, Ref2, 4}]\nCaller: waiting for Ref2", "The next call uses a new reference and asks to add four."],
    ["Return the new total", "State: 7\nCounter mailbox: []\nCaller mailbox: []\nadd/2 returns: 7", "The counter computes 3 + 4 and replies. The caller takes that reply. The counter continues as loop(7)."]
  ],
  unmatched: [
    ["An unsupported message arrives", "State: 0\nCounter mailbox: [hello]", "Neither receive clause matches hello, so it stays queued."],
    ["A valid request arrives", "State: 0\nCounter mailbox: [hello, {add, Caller, Ref1, 3}]", "A receive can select a later matching message without removing an earlier unmatched message."],
    ["Handle the addition", "State: 3\nCounter mailbox: [hello]\nCaller mailbox: [{Ref1, 3}]", "The counter removes only the add request, updates its state, and sends the reply."],
    ["Return to waiting", "State: 3\nCounter mailbox: [hello]\nadd/2 returns: 3", "The caller takes the reply. The counter still has the unmatched message. This small example has no clause for discarding it."]
  ],
  timeout: [
    ["Send a request", "State: 0\nCounter mailbox: [{add, Caller, Ref1, 3}]\nCaller: waiting for Ref1", "Suppose the counter does not handle this request before the caller's wait expires."],
    ["The wait expires", "State: 0\nCounter mailbox: [{add, Caller, Ref1, 3}]\nadd/2 returns: timeout", "The timeout ends the caller's receive. It does not remove the queued request."],
    ["The counter runs later", "State: 3\nCounter mailbox: []\nCaller mailbox: [{Ref1, 3}]", "The counter applies the addition and sends a late reply. The first call has already returned."],
    ["A retry is another request", "State: 3\nCounter mailbox: [{add, Caller, Ref2, 3}]\nCaller mailbox: [{Ref1, 3}]", "A second add/2 call creates Ref2. This counter has no duplicate-request detection."],
    ["The retry also updates the state", "State: 6\nCounter mailbox: []\nCaller mailbox: [{Ref1, 3}]\nSecond add/2 returns: 6", "The counter adds three again. The caller takes the Ref2 reply, leaving the old Ref1 reply queued."]
  ]
};

const scenario = document.getElementById("counter-scenario");
const previous = document.getElementById("counter-prev");
const next = document.getElementById("counter-next");
let counterStep = 0;

function showCounterStep() {
  const steps = counterSteps[scenario.value];
  const [title, state, explanation] = steps[counterStep];
  document.getElementById("counter-title").textContent = title;
  document.getElementById("counter-state").textContent = state;
  document.getElementById("counter-explanation").textContent = explanation;
  document.getElementById("counter-progress").textContent = `Step ${counterStep + 1} of ${steps.length}`;
  previous.disabled = counterStep === 0;
  next.disabled = counterStep === steps.length - 1;
}
scenario.addEventListener("change", () => { counterStep = 0; showCounterStep(); });
previous.addEventListener("click", () => { counterStep--; showCounterStep(); });
next.addEventListener("click", () => { counterStep++; showCounterStep(); });
document.getElementById("counter-reset").addEventListener("click", () => { counterStep = 0; showCounterStep(); });
showCounterStep();
