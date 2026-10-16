import https from "https";

const ETRADE_BASE = "https://etrade.gov.et/api";
const HEADERS = {
  Referer: "https://etrade.gov.et",
  Origin: "https://etrade.gov.et",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
};
const AGENT = new https.Agent({ rejectUnauthorized: false });

function etradeGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      rejectUnauthorized: false,
      headers: HEADERS,
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => {
        data += c;
      });
      res.on("end", () => {
        if (res.statusCode >= 400)
          return reject(new Error(`HTTP ${res.statusCode}`));
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON"));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

const API_ROOT = "/api/v1";

export async function getBusinessRegistration(req, res, next) {
  try {
    const tin = req.params.tin;
    if (!/^\d{5,15}$/.test(tin)) {
      return res.status(400).json({ message: "TIN must be 5-15 digits" });
    }

    const reg = await etradeGet(
      `${ETRADE_BASE}/Registration/GetRegistrationInfoByTin/${tin}/am`,
    );
    if (!reg?.Tin) {
      return res
        .status(404)
        .json({ message: "No business record found for this TIN" });
    }

    const business = reg.Businesses?.[0] || null;
    const associate = reg.AssociateShortInfos?.[0] || null;

    const result = {
      tin,
      ownerName: associate?.ManagerNameEng || reg.BusinessName || "",
      businessName: reg.BusinessName || "",
      region: "",
      woreda: "",
      kebele: "",
      houseNo: "",
      phone: associate?.MobilePhone || associate?.RegularPhone || "",
      photoBase64: associate?.Photo || null,
      licenseNo: business?.LicenceNumber || null,
      renewedTo: business?.RenewedTo || null,
      _links: { self: { href: `${API_ROOT}/business-registrations/${tin}` } },
    };


    if (result.licenseNo) {
      try {
        const lic = await etradeGet(
          `${ETRADE_BASE}/BusinessMain/GetBusinessByLicenseNo` +
            `?LicenseNo=${encodeURIComponent(result.licenseNo)}&Tin=${tin}&Lang=am`,
        );
        const addr = lic.AddressInfo || {};
        const licAssociate = lic.AssociateShortInfos?.[0] || null;

        result.region = addr.Region || "";
        result.woreda = addr.Woreda || "";
        result.kebele = addr.Kebele || "";
        result.houseNo = addr.HouseNo || "";
        result.phone =
          addr.MobilePhone ||
          addr.RegularPhone ||
          licAssociate?.MobilePhone ||
          licAssociate?.RegularPhone ||
          result.phone;
        result.photoBase64 = licAssociate?.Photo || result.photoBase64;
        result.renewedTo = lic.RenewedTo || result.renewedTo;
      } catch {}
    }

    res.set("Cache-Control", "private, max-age=86400");
    res.json(result);
  } catch (err) {
    next(err);
  }
}
