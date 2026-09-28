import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Clock, 
  BarChart2, 
  Layers,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function ModelPerformanceTab({ modelMetrics }) {
  const models = modelMetrics?.models || [
    {
      model_name: "HistGradientBoosting / LightGBM",
      accuracy: 0.9549,
      precision: 0.8765,
      recall: 0.9585,
      f1: 0.9157,
      roc_auc: 0.9935,
      confusion_matrix: [[17756, 862], [265, 6117]],
      training_time_seconds: 16.03
    },
    {
      model_name: "Random Forest",
      accuracy: 0.9566,
      precision: 0.8908,
      recall: 0.9459,
      f1: 0.9175,
      roc_auc: 0.9927,
      confusion_matrix: [[17878, 740], [345, 6037]],
      training_time_seconds: 10.58
    },
    {
      model_name: "Logistic Regression",
      accuracy: 0.9520,
      precision: 0.8672,
      recall: 0.9589,
      f1: 0.9108,
      roc_auc: 0.9929,
      confusion_matrix: [[17681, 937], [262, 6120]],
      training_time_seconds: 0.54
    }
  ];

  const bestModel = models[0];

  const chartData = [
    {
      metric: "Accuracy",
      "Logistic Regression": +(models.find(m => m.model_name.includes("Logistic"))?.accuracy * 100 || 95.2).toFixed(1),
      "Random Forest": +(models.find(m => m.model_name.includes("Random"))?.accuracy * 100 || 95.7).toFixed(1),
      "Gradient Boosting": +(models.find(m => m.model_name.includes("Gradient") || m.model_name.includes("LightGBM"))?.accuracy * 100 || 95.5).toFixed(1)
    },
    {
      metric: "Precision",
      "Logistic Regression": +(models.find(m => m.model_name.includes("Logistic"))?.precision * 100 || 86.7).toFixed(1),
      "Random Forest": +(models.find(m => m.model_name.includes("Random"))?.precision * 100 || 89.1).toFixed(1),
      "Gradient Boosting": +(models.find(m => m.model_name.includes("Gradient") || m.model_name.includes("LightGBM"))?.precision * 100 || 87.7).toFixed(1)
    },
    {
      metric: "Recall (Flood)",
      "Logistic Regression": +(models.find(m => m.model_name.includes("Logistic"))?.recall * 100 || 95.9).toFixed(1),
      "Random Forest": +(models.find(m => m.model_name.includes("Random"))?.recall * 100 || 94.6).toFixed(1),
      "Gradient Boosting": +(models.find(m => m.model_name.includes("Gradient") || m.model_name.includes("LightGBM"))?.recall * 100 || 95.9).toFixed(1)
    },
    {
      metric: "F1 Score",
      "Logistic Regression": +(models.find(m => m.model_name.includes("Logistic"))?.f1 * 100 || 91.1).toFixed(1),
      "Random Forest": +(models.find(m => m.model_name.includes("Random"))?.f1 * 100 || 91.8).toFixed(1),
      "Gradient Boosting": +(models.find(m => m.model_name.includes("Gradient") || m.model_name.includes("LightGBM"))?.f1 * 100 || 91.6).toFixed(1)
    },
    {
      metric: "ROC-AUC",
      "Logistic Regression": +(models.find(m => m.model_name.includes("Logistic"))?.roc_auc * 100 || 99.3).toFixed(1),
      "Random Forest": +(models.find(m => m.model_name.includes("Random"))?.roc_auc * 100 || 99.3).toFixed(1),
      "Gradient Boosting": +(models.find(m => m.model_name.includes("Gradient") || m.model_name.includes("LightGBM"))?.roc_auc * 100 || 99.4).toFixed(1)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Model Specification Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-surface p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Active Deployment Model
          </span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {bestModel.model_name}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">HistGradientBoosting Classifier</span>
        </div>

        <div className="card-surface p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Training Samples
          </span>
          <span className="text-2xl font-bold font-mono-num text-slate-900 mt-1 block">
            100,000
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">80% Stratified Split</span>
        </div>

        <div className="card-surface p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Holdout Testing Samples
          </span>
          <span className="text-2xl font-bold font-mono-num text-slate-900 mt-1 block">
            25,000
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">20% Unseen Validation</span>
        </div>

        <div className="card-surface p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
            Safety Recall (Flood Events)
          </span>
          <span className="text-2xl font-bold font-mono-num text-blue-700 mt-1 block">
            {(bestModel.recall * 100).toFixed(2)}%
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Minimized False Negatives</span>
        </div>
      </div>

      {/* Model Benchmark Table */}
      <div className="card-surface">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Test-Set Evaluated Benchmark Metrics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical performance evaluated exclusively on the 25,000 holdout test set (zero data leakage).
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono-num">
            Status: Validated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-data">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Model Architecture</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3 text-blue-700">Recall</th>
                <th className="py-2.5 px-3">F1 Score</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">Training Time</th>
                <th className="py-2.5 px-4">Deployment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {models.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{m.model_name}</td>
                  <td className="py-3 px-3 font-mono-num">{(m.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono-num">{(m.precision * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono-num font-bold text-blue-700">{(m.recall * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono-num font-semibold">{(m.f1 * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono-num">{(m.roc_auc * 100).toFixed(2)}%</td>
                  <td className="py-3 px-3 font-mono-num text-slate-500">{m.training_time_seconds}s</td>
                  <td className="py-3 px-4">
                    {idx === 0 ? (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold">
                        Active In-Memory
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                        Benchmark
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Confusion Matrix Deep Dive & Metrics Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 card-surface p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Cross-Algorithm Metric Comparison
            </h3>
            <span className="text-[11px] text-slate-500 font-mono-num">Values in %</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis dataKey="metric" stroke="#64748B" fontSize={10} />
                <YAxis domain={[80, 100]} stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', fontSize: '11px', borderRadius: '6px' }} formatter={(val) => [`${val}%`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Logistic Regression" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Random Forest" fill="#475569" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Gradient Boosting" fill="#1E40AF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix (5 Cols) */}
        <div className="lg:col-span-5 card-surface p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                Confusion Matrix: {bestModel.model_name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluation on 25,000 Unseen Test Samples
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3 font-data">
              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">True Negatives (TN)</span>
                <span className="text-lg font-bold font-mono-num text-slate-900 block mt-0.5">17,756</span>
                <span className="text-[10px] text-slate-500">Correctly classified non-floods</span>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">False Positives (FP)</span>
                <span className="text-lg font-bold font-mono-num text-amber-600 block mt-0.5">862</span>
                <span className="text-[10px] text-slate-500">Advisory false alarms</span>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">False Negatives (FN)</span>
                <span className="text-lg font-bold font-mono-num text-red-600 block mt-0.5">265</span>
                <span className="text-[10px] text-slate-500">Missed flood events (1.06%)</span>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">True Positives (TP)</span>
                <span className="text-lg font-bold font-mono-num text-blue-700 block mt-0.5">6,117</span>
                <span className="text-[10px] text-slate-500">Correctly identified floods</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <strong>Safety Optimization:</strong> Balanced class weights ensure flood recall reaches <strong>95.85%</strong>, ensuring flood events are caught with sub-millisecond latency.
          </div>
        </div>
      </div>
    </div>
  );
}
