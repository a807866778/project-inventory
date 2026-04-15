"use client";

import { useState } from "react";
import { createUser } from "./actions";

export function UserForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createUser(null, formData);
      if (result?.error) { setError(result.error); }
      if (result?.success) { setSuccess(true); e.currentTarget.reset(); }
    } catch { setError("创建失败"); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">员工账号创建成功！</div>}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">用户名 *</label>
          <input type="text" name="username" className="input" placeholder="用于登录" required />
        </div>
        <div>
          <label className="label">姓名 *</label>
          <input type="text" name="realName" className="input" placeholder="显示名称" required />
        </div>
        <div>
          <label className="label">初始密码 *</label>
          <input type="password" name="password" className="input" placeholder="登录密码" required />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary">{loading ? "创建中..." : "创建员工账号"}</button>
    </form>
  );
}
