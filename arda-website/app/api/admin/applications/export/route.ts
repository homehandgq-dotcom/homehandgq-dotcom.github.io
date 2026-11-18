import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { requirePermissionApi } from "@/lib/auth/apiGuard";
import { listApplicationsAdmin, type ApplicationFilters } from "@/lib/admin/applications";
import { writeAuditLog, getRequestIp } from "@/lib/utils/audit";

export const dynamic = "force-dynamic";

const COLUMNS = [
  { key: "application_no", label: "申请编号" },
  { key: "real_name", label: "真实姓名" },
  { key: "english_name", label: "英文姓名" },
  { key: "phone", label: "电话" },
  { key: "email", label: "邮箱" },
  { key: "company_name_zh", label: "公司" },
  { key: "title", label: "职位" },
  { key: "state", label: "州" },
  { key: "city", label: "城市" },
  { key: "industry", label: "行业" },
  { key: "membership_type", label: "会员类型" },
  { key: "status", label: "状态" },
  { key: "created_at", label: "提交日期" },
];

export async function GET(request: NextRequest) {
  const guard = await requirePermissionApi("applications.export");
  if (!guard.ok) return guard.response;

  const { searchParams } = request.nextUrl;
  const filters: ApplicationFilters = {
    q: searchParams.get("q") || undefined,
    status: (searchParams.get("status") as ApplicationFilters["status"]) || "all",
    state: searchParams.get("state") || undefined,
    industryId: searchParams.get("industryId") || undefined,
    membershipTypeId: searchParams.get("membershipTypeId") || undefined,
    chapterId: searchParams.get("chapterId") || undefined,
    pageSize: 10000,
    page: 1,
  };
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const { items } = await listApplicationsAdmin(filters);

  const rows = items.map((item) => ({
    application_no: item.application_no,
    real_name: item.real_name,
    english_name: item.english_name || "",
    phone: item.phone,
    email: item.email,
    company_name_zh: item.company_name_zh || "",
    title: item.title || "",
    state: item.state,
    city: item.city,
    industry: (item as unknown as { industries?: { name_zh: string } }).industries?.name_zh || "",
    membership_type: (item as unknown as { membership_types?: { name_zh: string } }).membership_types?.name_zh || "",
    status: item.status,
    created_at: new Date(item.created_at).toLocaleString("zh-CN"),
  }));

  await writeAuditLog({
    actorId: guard.admin.id,
    action: "applications.export",
    entityTable: "member_applications",
    afterJson: { format, count: rows.length, filters },
    ipAddress: getRequestIp(request.headers),
  });

  const filename = `arda-applications-${new Date().toISOString().slice(0, 10)}`;

  if (format === "csv") {
    const csv = Papa.unparse({
      fields: COLUMNS.map((c) => c.label),
      data: rows.map((r) => COLUMNS.map((c) => r[c.key as keyof typeof r])),
    });
    const bom = "﻿"; // 保证 Excel 打开中文不乱码
    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("会员申请");
  sheet.columns = COLUMNS.map((c) => ({ header: c.label, key: c.key, width: 18 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((r) => sheet.addRow(r));

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    },
  });
}
