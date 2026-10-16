import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export async function nextSequence(key, start = 0) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 }, $setOnInsert: {} },
    { new: true, upsert: true },
  );

  return doc.seq + start;
}

export async function setSequenceIfHigher(key, targetSeq) {
  await Counter.updateOne(
    { key },
    { $max: { seq: targetSeq } },
    { upsert: true }
  );
}

export default Counter;
