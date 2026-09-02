export function formatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function splitEqual(amount, ids) {
  if (!ids || !ids.length) return {};
  
  const totalCents = Math.round(amount * 100);
  const n = ids.length;
  const baseShareCents = Math.floor(totalCents / n);
  let extraCents = totalCents % n;

  const shares = {};
  ids.forEach((id) => {
    
    const individualCents = baseShareCents + (extraCents > 0 ? 1 : 0);
    if (extraCents > 0) extraCents--;
    shares[id] = individualCents / 100;
  });
  
  return shares;
}

export function percentsSumTo100(percents) {
  const values = Object.values(percents).map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
 
  return Math.abs(sum - 100) < 0.01;
}

export function splitByPercent(amount, percents) {
  const totalCents = Math.round(amount * 100);
  const shares = {};
  let distributedCents = 0;
  
  const entries = Object.entries(percents);
  
  entries.forEach(([id, pct], index) => {
    if (index === entries.length - 1) {
      
      shares[id] = (totalCents - distributedCents) / 100;
    } else {
      const calculatedCents = Math.round((amount * Number(pct) * 100) / 100);
      shares[id] = calculatedCents / 100;
      distributedCents += calculatedCents;
    }
  });
  
  return shares;
}

export function sharesForExpense(expense) {
  if (expense.splitType === "percent" && expense.percents) {
    return splitByPercent(expense.amount, expense.percents);
  }
  return splitEqual(expense.amount, expense.splitWith);
}
