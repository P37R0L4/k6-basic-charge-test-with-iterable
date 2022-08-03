import http from "k6/http";
import { sleep } from "k6";
import { Trend, Rate, counter } from "k6/metrics";
import { check, fail } from "k6";

export let GetCustomerDuration = new Trend("get_costumer_duration");
export let GetCustomerFailRate = new Trend("get_costumer_fail_rate");
export let GetCustomerSuccessRate = new Trend("get_costumer_seccess_rate");
export let GetCustomerReqs = new Trend("get_customer_reqs");

const arr = [
  {
    uri: "", // Put url here
    payload: JSON.stringify({
      // Put payload here
    }),
  },
];

function iterateURI(url, payload) {
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = http.post(url, payload, params);

  GetCustomerDuration.add(res.timings.duration);
  GetCustomerReqs.add(1);
  GetCustomerFailRate.add(res.status == 0 || res.status > 399);
  GetCustomerSuccessRate.add(res.status < 399);

  const maxDuration = 4000;

  let durationMsg = `Max Duration ${maxDuration / 1000}s`;
  let hasErrorAlert = `Has error alert`;
  let hasWaringAlert = `Has Warning alert`;

  if (
    !check(res, {
      "max duration": (r) => r.timings.duration < maxDuration,
    })
  ) {
    GetCustomerFailRate(durationMsg);
  }

  if (
    check(res, {
      error: (r) => r.error,
    })
  ) {
    GetCustomerFailRate(hasErrorAlert);
  }

  if (
    check(res, {
      warning: (r) => r.warning,
    })
  ) {
    GetCustomerFailRate(hasWaringAlert);
  }

  sleep(1);
}

export default function () {
  arr.forEach((data) => {
    iterateURI(data.uri, data.payload);
    sleep(2);
  });
}
