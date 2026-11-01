import { s } from "./Primitives";

// Fixed dates and values are explicitly demo data, independent of the current account.
const days = Array.from({ length: 112 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 5, 15 + index)).toISOString().slice(0, 10),
  count: [0, 8, 0, 12, 4, 0, 16][index % 7],
}));
export function ActivityHeatmap() {
  return <><p className={s.note}>Lịch minh họa 15/06–04/10/2026, không phải lịch tài khoản. Màu nhạt: 0 từ · xanh vừa: 1–9 từ · xanh đậm: từ 10 từ.</p><div className={s.heatmap} aria-hidden="true">{days.map(day => <span key={day.date} data-count={day.count === 0 ? 0 : day.count < 10 ? 1 : 2} title={`${day.date}: ${day.count} từ`}/>)}</div><details><summary>Xem dữ liệu lịch theo ngày</summary><div className={s.tableWrap}><table className={s.table}><caption>Dữ liệu minh họa của lịch hoạt động</caption><thead><tr><th scope="col">Ngày</th><th scope="col">Số từ</th></tr></thead><tbody>{days.map(day => <tr key={day.date}><td>{day.date}</td><td>{day.count}</td></tr>)}</tbody></table></div></details></>;
}
