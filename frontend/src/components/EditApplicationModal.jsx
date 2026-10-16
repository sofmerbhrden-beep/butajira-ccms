import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/hooks/useAppData.js";

const inputCls =
  "w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3C8DBC]/30 focus:border-[#3C8DBC] transition-colors";

const labelCls =
  "block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1";

export default function EditApplicationModal({ app, onClose }) {
  const { updateApplication } = useAppData();

  const [formData, setFormData] = useState({
    fullName: app.applicant?.fullName || "",
    gender: app.applicant?.gender || "male",
    phone: app.applicant?.phone || "",
    region: app.applicant?.address?.region || "",
    woreda: app.applicant?.address?.woreda || "",
    kebele: app.applicant?.address?.kebele || "",
    houseNo: app.applicant?.address?.houseNo || "",
    poBox: app.applicant?.address?.poBox || "",
    fax: app.applicant?.address?.fax || "",
    email: app.applicant?.address?.email || "",
    licenseOwnerAddress: app.applicant?.address?.licenseOwnerAddress || "",
    tin: app.tin || "",
    businessName: app.businessName || "",
    hasTradeLicense: !!app.hasTradeLicense,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch = {
        applicantInfo: {
          fullName: formData.fullName,
          gender: formData.gender,
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
          }
        },
        tin: formData.tin,
        businessName: formData.businessName,
        hasTradeLicense: formData.hasTradeLicense
      };

      await updateApplication(app.id, patch);
      toast.success("Application details updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl my-6 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Application</p>
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Edit Details</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">

          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#3C8DBC] mb-3">Applicant Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputCls}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#3C8DBC] mb-3">Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Region</label>
                <input type="text" name="region" value={formData.region} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Woreda</label>
                <input type="text" name="woreda" value={formData.woreda} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Kebele</label>
                <input type="text" name="kebele" value={formData.kebele} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>House No.</label>
                <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>P.O. Box</label>
                <input type="text" name="poBox" value={formData.poBox} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fax</label>
                <input type="text" name="fax" value={formData.fax} onChange={handleChange} className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Applicant Address (የአመልካች አድራሻ)</label>
                <input type="text" name="licenseOwnerAddress" value={formData.licenseOwnerAddress} onChange={handleChange} className={inputCls} />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#3C8DBC] mb-3">Business Information</p>
            <label className="flex items-center gap-2.5 cursor-pointer mb-4 w-fit">
              <input
                type="checkbox"
                name="hasTradeLicense"
                checked={formData.hasTradeLicense}
                onChange={handleChange}
                className="w-4 h-4 rounded border border-gray-300 accent-[#3C8DBC] cursor-pointer"
              />
              <span className="text-[13px] font-medium text-gray-700">Has Trade License</span>
            </label>
            {formData.hasTradeLicense && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>TIN Number</label>
                  <input type="text" name="tin" value={formData.tin} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Business Name</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className={inputCls} />
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#3C8DBC] rounded-lg hover:bg-[#347aaa] transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save size={14} strokeWidth={2.5} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
