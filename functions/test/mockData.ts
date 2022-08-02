export const getValidAtomFeed = (secondEntry?: string) => `<?xml version="1.0" encoding="UTF-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom"
    xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"
    xmlns:georss="http://www.georss.org/georss">
    <id>urn:uuid:7d3dea95-b739-4cb3-a688-92422cb8b942</id>
    <title>Tsunami Information Statement Number 1</title>
    <updated>2022-07-15T22:37:07Z</updated>
    <author>
      <name>NWS National Tsunami Warning Center Palmer AK</name>
      <uri>http://ntwc.arh.noaa.gov/</uri>
      <email>ntwc@noaa.gov</email>
    </author>
    <icon>http://ntwc.arh.noaa.gov/images/favicon.ico</icon>
    <link type="application/atom+xml" rel="self" title="self" href="http://ntwc.arh.noaa.gov/events/xml/PAAQAtom.xml"/>
    <entry>
      <title>180 miles SE of Kodiak City, Alaska</title>
      <updated>2022-07-15T22:37:07Z</updated>
      <geo:lat>56.228</geo:lat>
      <geo:long>-148.670</geo:long>
      <summary type="xhtml">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <strong>Category:</strong> Information<br/>
          <strong>Bulletin Issue Time: </strong> 2022.07.15 22:37:07 UTC <br/>
          <strong>Preliminary Magnitude: </strong>4.5(Ml)<br/>
          <strong>Lat/Lon: </strong>56.228 / -148.670<br/>
          <strong>Affected Region: </strong>180 miles SE of Kodiak City, Alaska<br/>
          <b>Note:</b>  * There is NO tsunami danger from this earthquake.<br/>
          <strong>Definition: </strong>An information statement indicates that an earthquake has occurred, but does not pose a tsunami threat, or that a tsunami warning, advisory, or watch has been issued for another section of the ocean. <a href="http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/WEAK53.txt">View bulletin</a>
        </div>
    </summary>
    <id>urn:uuid:5bdc0d76-910d-498b-942e-364f4118f6ae</id>
    <link rel="related" title="CapXML document" href="http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/PAAQCAP.xml" type="application/cap+xml" />
    <link rel="alternate" title="Bulletin" href="http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/WEAK53.txt" type="application/xml" />
  </entry>
  ${secondEntry ?? ''}
  </feed>
`;
