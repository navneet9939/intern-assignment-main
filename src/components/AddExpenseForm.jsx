import { useMemo, useState } from "react";
import { percentsSumTo100 } from "../lib/money.js";

const CATEGORIES = ["Food", "Travel", "Fun", "Stay"];

function evenPercents(ids) {
  if (!ids.length) return {};
  const base = Number((100 / ids.length).toFixed(2));
  const pcts = {};
  ids.forEach((id, i) => {
    pcts[id] = i === ids.length - 1 ? Number((100 - base * (ids.length - 1)).toFixed(2)) : base;
  });
  return pcts;
}

export default function AddExpenseForm({ members, onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.id ? String(members[0].id) : "");
  const [date, setDate] = useState("2026-03-16");
  const [category, setCategory] = useState("Food");
  const [splitType, setSplitType] = useState("equal");
  const [splitWith, setSplitWith] = useState(members.map((m) => String(m.id)));
  const [percents, setPercents] = useState(evenPercents(members.map((m) => String(m.id))));
  const [error, setError] = useState("");

  const selected = useMemo(
    () => members.filter((m) => splitWith.includes(String(m.id))),
    [members, splitWith]
  );

  function toggleMember(id) {
    const stringId = String(id);
    setSplitWith((prev) => {
      const next = prev.includes(stringId) ? prev.filter((x) => x !== stringId) : [...prev, stringId];
      setPercents(evenPercents(next));
      return next;
    });
  }

  function submit(e) {
    e.preventDefault();
    setError("");
    const n = Number(amount);
    if (!description.trim() || !Number.isFinite(n) || n <= 0) {
      setError("Add a description and a positive amount.");
      return;
    }
    if (!splitWith.length) {
      setError("Pick at least one person to split with.");
      return;
    }
    
    // Convert text state objects safely back to numeric float hashes for lib verification helper
    const numericPercents = {};
    for (const key in percents) {
      numericPercents[key] = Number(percents[key]) || 0;
    }

    if (splitType === "percent" && !percentsSumTo100(numericPercents)) {
      setError("Percentages must add up to exactly 100.");
      return;
    }

    onAdd({
      description: description.trim(),
      amount: n,
      paidBy: isNaN(Number(paidBy)) ? paidBy : Number(paidBy),
      splitType,
      splitWith: splitWith.map((id) => (isNaN(Number(id)) ? id : Number(id))),
      percents: splitType === "percent" ? numericPercents : undefined,
      date: new Date(date),
      category,
    });

    // Reset Form Fields after successful creation pass
    setDescription("");
    setAmount("");
  }

  return (
    <section className="card">
      <h2>Add expense</h2>
      <form onSubmit={submit}>
        <div className="row">
          <div className="field" style={{ flex: 2 }}>
            <label htmlFor="desc">Description</label>
            <input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
            />
          </div>
          <div className="field">
            <label htmlFor="amt">Amount</label>
            <input
              id="amt"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <div className="field">
            <label htmlFor="payer">Paid by</label>
            <select
              id="payer"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="cat">Category</label>
            <select
              id="cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="legend">Split between</div>
          <div className="chips" style={{ marginTop: 6 }}>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`chip ${splitWith.includes(String(m.id)) ? "on" : ""}`}
                onClick={() => toggleMember(m.id)}
              >
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <label className="check">
            <input
              type="radio"
              name="splitType"
              checked={splitType === "equal"}
              onChange={() => setSplitType("equal")}
            />
            Split equally
          </label>
          <label className="check">
            <input
              type="radio"
              name="splitType"
              checked={splitType === "percent"}
              onChange={() => {
                setSplitType("percent");
                setPercents(evenPercents(splitWith));
              }}
            />
            Custom %
          </label>
        </div>

        {splitType === "percent" && (
          <div className="percent-grid">
            {selected.map((m) => (
              <div className="percent-row" key={m.id}>
                <span>{m.name}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={percents[String(m.id)] ?? ""}
                  onChange={(e) =>
                    setPercents((p) => ({ ...p, [String(m.id)]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="error">{error}</p>}
        <div style={{ marginTop: 12 }}>
          <button className="btn" type="submit">
            Save expense
          </button>
        </div>
      </form>
    </section>
  );
}
