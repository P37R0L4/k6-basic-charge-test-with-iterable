import getAllReqs from "./scenarios/getAllReqs.js";
import { group, sleep } from "k6";

export default () => {
  group("Endpoint SentMessage - Controller Sent Message - OmnixAPI", () => {
    getAllReqs();
  });

  sleep(1);
};
