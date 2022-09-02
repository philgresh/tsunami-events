# Models

## High-level

On a regular basis[^1], we check the National Tsunami Warning Center (NTWC) Atom Feed[^2] for new **Events**. An Event has high-level information about earthquakes of interest, including a link to the [Common Alerting Protocol (CAP) document](https://www.tsunami.gov/cap/documents/CAP-TSU-v1.1.pdf), which we parse and abstract into an **Alert**. Alerts contain more details about the event, including current outlooks on severity/impact on specific geographic locations. Multiple **Alerts** may be generated as we learn more about the **Event**, so we choose to update **Participants** on every **Alert** that might be of interest to them.

Once an **Alert** is created, we identify each **Geo** which may be affected based on given [Universal Geographic Codes (UGC)](https://www.tsunami.gov/cap/documents/CAP-TSU-v1.1.pdf#%5B%7B%22num%22%3A47%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C72%2C670.4%2C0%5D). For example, a UGC value of `PZZ531` corresponds to San Francisco Bay south of the Bay Bridge[^3].

[^1]: Currently, every 5 minutes
[^2]: Future versions may support the Pacific Tsunami Warning Center (PTWC) [feed](https://www.tsunami.gov/events/xml/PHEBAtom.xml) as well.
[^3]: See this [National Weather Service directive](https://www.nws.noaa.gov/directives/sym/pd01003002curr.pdf) for maps of each Area of Responsibility.
