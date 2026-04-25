"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVietnameseDate } from "@/lib/utils";
import { DeleteTemplateDialog } from "@/components/templates/delete-template-dialog";

interface Row {
  id: string;
  orderNumber: number;
  name: string;
  lastUsedAt: Date | null;
  _count: { cases: number };
}

export function TemplateTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || String(r.orderNumber) === query.trim()
    );
  }, [rows, query]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Tìm theo tên hoặc số thứ tự..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">STT</TableHead>
              <TableHead>Tên văn bản</TableHead>
              <TableHead className="w-32 text-center">Số case</TableHead>
              <TableHead className="w-48">Lần dùng cuối</TableHead>
              <TableHead className="w-72 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Không có kết quả phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.orderNumber}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-center">{r._count.cases}</TableCell>
                  <TableCell className="text-muted-foreground">{formatVietnameseDate(r.lastUsedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="default">
                        <Link href={`/templates/${r.id}/cases/new`}>
                          <FileEdit className="mr-1 h-4 w-4" />
                          Tạo văn bản
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/templates/${r.id}/edit`}>
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPendingDelete(r)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Xoá
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteTemplateDialog
        template={pendingDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
