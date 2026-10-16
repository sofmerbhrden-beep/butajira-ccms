import React, { useState } from "react";
import { X, Upload, Save, User, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth.js";
import { useAppData } from "@/hooks/useAppData.js";
import { API_URL } from "@/config.js";
import FileDrop from "@/components/FileDrop.jsx";
import EthiopianDobPicker from "@/components/EthiopianDobPicker.jsx";

const SERVICE_TYPES = [
  { id: "new-business", name: "New Business Registration", code: "NBR" },
  { id: "renewal", name: "Business License Renewal", code: "BLR" },
];

export default function ImportLegacyModal({ onClose }) {
  const { token } = useAuth();
  const { refreshApplications } = useAppData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "male",
    dob: "",
    phone: "",
    email: "",
    region: "",
    woreda: "",
    kebele: "",
    houseNo: "",
    poBox: "",
    fax: "",
    licenseOwnerAddress: "",
    serviceTypeId: SERVICE_TYPES[0].id,
    hasTradeLicense: false,
    tin: "",
    businessName: "",
    referenceNumber: "",
    issueDate: "",
  });

  const [files, setFiles] = useState({
    photo: null,
    education: null,
    tradeLicense: null,
    otherDoc: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.referenceNumber) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const payload = {
      referenceNumber: formData.referenceNumber,
      issueDate: formData.issueDate,
      hasTradeLicense: formData.hasTradeLicense,
      tin: formData.tin,
      businessName: formData.businessName,
      serviceType: SERVICE_TYPES.find((s) => s.id === formData.serviceTypeId),
      applicantInfo: {
        fullName: formData.fullName,
        gender: formData.gender,
        dob: formData.dob,
        phone: formData.phone,
        address: {
          region: formData.region,
          woreda: formData.woreda,
          kebele: formData.kebele,
          houseNo: formData.houseNo,
          poBox: formData.poBox,
          fax: formData.fax,
          email: formData.email,
          licenseOwnerAddress: formData.licenseOwnerAddress,
        },
      },
    };

    const submitData = new FormData();
    submitData.append("data", JSON.stringify(payload));
    if (files.photo) submitData.append("photo", files.photo);
    if (files.education) submitData.append("education", files.education);
    if (files.tradeLicense) submitData.append("tradeLicense", files.tradeLicense);
    if (files.otherDoc) submitData.append("others", files.otherDoc);

    try {
      const res = await fetch(`${API_URL}/applications/legacy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to import legacy application");
      }

      toast.success("Legacy application imported successfully!");
      refreshApplications();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3C8DBC]/10 flex items-center justify-center text-[#3C8DBC]">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import Paper Certificate</h2>
              <p className="text-xs text-gray-500 font-medium">Digitize a pre-existing applicant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 text-sm bg-white">
          <form id="legacyForm" onSubmit={handleSubmit} className="space-y-8">

            <section>
              <h3 className="flex items-center gap-2 text-[#3C8DBC] font-semibold text-sm mb-4 pb-2 border-b border-gray-100">
                <FileText size={16} /> Original Certificate Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Original Reference Number *</label>
                  <input
                    name="referenceNumber"
                    required
                    placeholder="e.g. 015/2016"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">This exact number will be assigned to their digital certificate.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Original Issue Date *</label>
                  <EthiopianDobPicker
                    value={formData.issueDate}
                    onChange={(val) => setFormData((prev) => ({ ...prev, issueDate: val }))}
                    placeholder="Select original issue date"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-[#3C8DBC] font-semibold text-sm mb-4 pb-2 border-b border-gray-100">
                <User size={16} /> Applicant Identity & Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <EthiopianDobPicker
                    value={formData.dob}
                    onChange={(val) => setFormData((prev) => ({ ...prev, dob: val }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <input name="phone" required placeholder="+251..." value={formData.phone} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email</label>
                  <input name="email" type="email" placeholder="example@domain.com" value={formData.email} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Region</label>
                  <input name="region" required value={formData.region} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Woreda</label>
                  <input name="woreda" required value={formData.woreda} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Kebele</label>
                  <input name="kebele" required value={formData.kebele} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">House No</label>
                  <input name="houseNo" value={formData.houseNo} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">P.O. Box</label>
                  <input name="poBox" value={formData.poBox} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Fax</label>
                  <input name="fax" value={formData.fax} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">License Owner Address (if different)</label>
                  <input name="licenseOwnerAddress" placeholder="Full legal address for certificate output..." value={formData.licenseOwnerAddress} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-[#3C8DBC] font-semibold text-sm mb-4 pb-2 border-b border-gray-100">
                <FileText size={16} /> Business & Service Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Service Type</label>
                  <select name="serviceTypeId" value={formData.serviceTypeId} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]">
                    {SERVICE_TYPES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="hasTradeLicense" checked={formData.hasTradeLicense} onChange={handleChange} className="w-4 h-4 rounded text-[#3C8DBC] focus:ring-[#3C8DBC]" />
                    <span className="text-sm font-medium text-gray-800">Applicant has a Trade License</span>
                  </label>
                </div>
                {formData.hasTradeLicense && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">TIN</label>
                      <input name="tin" value={formData.tin} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Business Name</label>
                      <input name="businessName" value={formData.businessName} onChange={handleChange} className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]" />
                    </div>
                  </>
                )}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-[#3C8DBC] font-semibold text-sm mb-4 pb-2 border-b border-gray-100">
                <Upload size={16} /> Scanned Documents (Optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileDrop allowCamera={true} label="Applicant Photo" onChange={(f) => handleFileChange("photo", f)} file={files.photo} />
                <FileDrop allowCamera={true} label="Education Doc" onChange={(f) => handleFileChange("education", f)} file={files.education} />
                {formData.hasTradeLicense && <FileDrop allowCamera={true} label="Trade License" onChange={(f) => handleFileChange("tradeLicense", f)} file={files.tradeLicense} />}
                <FileDrop allowCamera={true} label="Other Document" onChange={(f) => handleFileChange("otherDoc", f)} file={files.otherDoc} />
              </div>
            </section>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="legacyForm"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#3C8DBC] rounded-lg hover:bg-[#357ca5] transition-colors disabled:opacity-50 shadow-md cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing...</span>
            ) : (
              <><Save size={16} /> Save Legacy Record</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
