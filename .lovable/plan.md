

## Generate ESG Report as PDF

### What we're building
Replace the toast-only ESG button with actual PDF generation using `jspdf` library. The PDF will contain the user's environmental impact data (food saved, CO2 reduced, monthly trends) formatted as a professional ESG report, and download directly to their device.

### Changes

**1. Install dependency**
- Add `jspdf` package for client-side PDF generation

**2. New utility: `src/utils/generateESGReport.ts`**
- Function that takes activity data (totalFood, totalCO2, totalOrders, totalRevenue, monthly array) and user name
- Generates a branded PDF with:
  - Title: "ESG Impact Report"
  - Date of generation
  - Summary metrics table (food saved, CO2 reduced, orders, revenue)
  - Monthly breakdown table (month, food saved, CO2 reduced)
  - Footer with app branding
- Triggers browser download via `doc.save()`

**3. Update `src/pages/ActivityPage.tsx`**
- Import the generate function
- Pass activity data + user profile name to the generator on button click
- Keep the toast as a success confirmation after download

### Technical details
- `jspdf` works entirely client-side, no server needed
- Uses `doc.save("esg-report.pdf")` which triggers a native browser download
- No changes to Supabase or backend required
- Monthly data table only included if data exists

