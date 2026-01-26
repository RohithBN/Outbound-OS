"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@/components/ui";

interface Goal {
  _id: string;
  raw_input: string;
  objective_type: string;
  status: string;
  target_count: number;
  current_count: number;
  deadline: string;
  criteria: { role?: string; location?: string; experience?: string; skills?: string[] };
  created_at: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (data.success) setGoals(data.goals);
    } catch (err) {
      console.error("Error fetching goals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");
    try {
      const res = await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raw_input: goalInput }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create goal");
      setGoals([data.goal, ...goals]);
      setIsModalOpen(false);
      setGoalInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredGoals = filterStatus === "all" ? goals : goals.filter((g) => g.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case "completed": return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";
      case "draft": return "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400";
      case "paused": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const getObjectiveIcon = (type: string) => {
    switch (type) { case "hiring": return "👥"; case "sales": return "💼"; case "partnership": return "🤝"; default: return "🎯"; }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your outreach goals and track progress</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Goal
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "draft", "active", "paused", "completed"].map((status) => (
          <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status ? "bg-orange-500 text-white" : "bg-white dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-orange-500/20 hover:bg-gray-50 dark:hover:bg-orange-500/10"}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-orange-500/20">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No goals yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first goal to start your outreach campaign</p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <div key={goal._id} className="bg-white dark:bg-black rounded-xl p-6 border border-gray-200 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <span className="text-2xl">{getObjectiveIcon(goal.objective_type)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>{goal.status}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{goal.raw_input}</h3>
              <div className="space-y-2 mb-4">
                {goal.criteria.role && <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Role:</span> {goal.criteria.role}</p>}
                {goal.criteria.location && <p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Location:</span> {goal.criteria.location}</p>}
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{goal.current_count}/{goal.target_count}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(goal.current_count / goal.target_count) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                <span className="capitalize">{goal.objective_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Goal">
        <form onSubmit={handleCreateGoal} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Describe your goal</label>
            <textarea value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="e.g., Hire 5 senior React developers in San Francisco within 30 days" className="w-full px-4 py-3 border border-gray-200 dark:border-orange-500/20 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-black placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none" rows={4} required />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Our AI will parse your goal and create a structured campaign</p>
          </div>
          {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth isLoading={isCreating}>Create Goal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
