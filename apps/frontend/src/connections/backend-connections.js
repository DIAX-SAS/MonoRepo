import { getSiteURL } from "@/lib/get-site-url";

const URL = getSiteURL("backend").concat("api");

export async function fetchData(startDate, endDate,settings) {
 
  if(!settings)
    settings = {
      live: true,
      offset: true,
      machine: [],
      worker: [],
      order: [],
      lot: [],
      mold: [],
      material: []
    };
  return await fetch(URL.concat("/plc/data"), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initTime: startDate, endTime: endDate,config: settings}),
  }).then((response) => response);
}
