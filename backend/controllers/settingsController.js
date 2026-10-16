import Settings from "../models/Settings.js";

const FIELDS = [
  "orgNameEn",
  "orgNameAm",
  "address",
  "contactEmail",
  "contactPhone",
];

export async function getSettings(req, res, next) {
  try {
    const s = (await Settings.findById("org")) || new Settings();
    res.set("Cache-Control", "private, max-age=60");
    res.json(pick(s));
  } catch (err) {
    next(err);
  }
}

export async function replaceSettings(req, res, next) {
  try {
    const update = {};
    for (const f of FIELDS) {
      if (req.body[f] !== undefined) update[f] = String(req.body[f]).trim();
    }
    const s = await Settings.findByIdAndUpdate(
      "org",
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    res.json(pick(s));
  } catch (err) {
    next(err);
  }
}

function pick(s) {
  return {
    orgNameEn: s.orgNameEn,
    orgNameAm: s.orgNameAm,
    address: s.address,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
  };
}
