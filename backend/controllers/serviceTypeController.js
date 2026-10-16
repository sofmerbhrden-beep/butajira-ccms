import ServiceType from "../models/ServiceType.js";
import {
  serviceTypeRepresentation,
  API_ROOT,
} from "../utils/representations.js";

export async function getServiceTypes(req, res, next) {
  try {
    const filter = req.user?.role === "admin" ? {} : { active: true };
    const types = await ServiceType.find(filter).sort({ stId: 1 });

    res.set("Cache-Control", "private, max-age=300");
    res.json({
      items: types.map((s) =>
        serviceTypeRepresentation(s, { requester: req.user }),
      ),
      _links: { self: { href: `${API_ROOT}/service-types` } },
    });
  } catch (err) {
    next(err);
  }
}

export async function getServiceType(req, res, next) {
  try {
    const type = await ServiceType.findOne({ stId: req.params.stId });
    if (!type)
      return res.status(404).json({ message: "Service type not found" });
    if (!type.active && req.user?.role !== "admin") {
      return res.status(404).json({ message: "Service type not found" });
    }
    res.set("Cache-Control", "private, max-age=300");
    res.json(serviceTypeRepresentation(type, { requester: req.user }));
  } catch (err) {
    next(err);
  }
}

export async function createServiceType(req, res, next) {
  try {
    const { code, tier, name, nameAm } = req.body;
    if (!code?.trim() || !name?.trim()) {
      return res.status(400).json({ message: "Code and name are required" });
    }

    const last = await ServiceType.findOne().sort({ stId: -1 });
    const lastNum = last ? parseInt(last.stId.replace("st-", ""), 10) : 0;
    const stId = `st-${String(lastNum + 1).padStart(2, "0")}`;

    const created = await ServiceType.create({
      stId,
      code: code.trim(),
      tier: tier?.trim() || null,
      name: name.trim(),
      nameAm: nameAm?.trim() || "",
    });

    res
      .status(201)
      .location(`${API_ROOT}/service-types/${created.stId}`)
      .json(serviceTypeRepresentation(created, { requester: req.user }));
  } catch (err) {
    next(err);
  }
}

export async function updateServiceType(req, res, next) {
  try {
    const type = await ServiceType.findOne({ stId: req.params.stId });
    if (!type)
      return res.status(404).json({ message: "Service type not found" });

    const { code, tier, name, nameAm, active } = req.body;
    if (code !== undefined) type.code = String(code).trim();
    if (tier !== undefined) type.tier = tier ? String(tier).trim() : null;
    if (name !== undefined) type.name = String(name).trim();
    if (nameAm !== undefined) type.nameAm = String(nameAm).trim();
    if (active !== undefined) type.active = !!active;

    await type.save();
    res.json(serviceTypeRepresentation(type, { requester: req.user }));
  } catch (err) {
    next(err);
  }
}

export async function deleteServiceType(req, res, next) {
  try {
    const type = await ServiceType.findOne({ stId: req.params.stId });
    if (!type)
      return res.status(404).json({ message: "Service type not found" });

    type.active = false;
    await type.save();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
