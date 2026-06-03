import { useState, FormEvent } from "react";
import { 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  Gamepad2, 
  Cpu, 
  Image as ImageIcon, 
  HelpCircle, 
  Share2, 
  RefreshCw, 
  Lightbulb, 
  Code2, 
  Compass,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { GameBlueprint, GeneratorRequest } from "./types";

const PRESET_IDEAS = [
  { name: "Cyberpunk Tetris", genre: "Puzzle / Arcade", artStyle: "Neon Retro Cyberpunk", platform: "Web Sandbox", details: "Thêm các ô kỹ năng đặc biệt và thanh năng lượng hack thời gian." },
  { name: "Mecha Farming RPG", genre: "Farming Simulator", artStyle: "2D Pixel Art Top-Down", platform: "Mobile & Web", details: "Trồng trọt kết hợp bảo trì người máy chiến đấu bảo vệ trang trại." },
  { name: "Pixel Space Rogue-lite", genre: "Rogue-lite Shooter", artStyle: "8-Bit Retro Space", platform: "PC / Web", details: "Bản đồ sinh ngẫu nhiên vũ trụ, nâng cấp vũ khí laser từng đợt quái vật." },
  { name: "Flappy Magic Dragon", genre: "Endless Runner / Casual", artStyle: "Cute Watercolor 2D", platform: "Mobile Web Browser", details: "Cơ chế Flappy huyền thoại nhưng rồng có thể phun lửa phá chướng ngại vật cực kỳ vui nhộn." }
];

export default function App() {
  const [gameName, setGameName] = useState("");
  const [customGenre, setCustomGenre] = useState("RPG / Hành Động");
  const [targetPlatform, setTargetPlatform] = useState("Trình duyệt Web (HTML5)");
  const [artStyle, setArtStyle] = useState("2D Pixel Art");
  const [customDetails, setCustomDetails] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiSuccessMsg, setApiSuccessMsg] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<GameBlueprint | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Trigger quick presets
  const handleApplyPreset = (preset: typeof PRESET_IDEAS[0]) => {
    setGameName(preset.name);
    setCustomGenre(preset.genre);
    setArtStyle(preset.artStyle);
    setTargetPlatform(preset.platform);
    setCustomDetails(preset.details);
  };

  // Execute API Request
  const handleGenerateBlueprint = async (e: FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) {
      setError("Vui lòng nhập tên trò chơi trước khi khởi tạo bản thiết kế!");
      return;
    }

    setLoading(true);
    setError(null);
    setApiSuccessMsg(null);
    setBlueprint(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameName: gameName.trim(),
          customGenre,
          targetPlatform,
          artStyle,
          customDetails
        }),
      });

      if (!response.ok) {
        let errMsg = `Mã lỗi máy chủ: ${response.status}.`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg += ` Chi tiết: ${errData.error}. ${errData.details || ""}`;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setBlueprint(data);
      setApiSuccessMsg("Thiết lập bản vẽ kiến trúc game thành công bởi Qwen & Gemini!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi không xác định trong quá trình truyền tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Tool to copy string to clipboard
  const handleCopyToClipboard = (text: string, elementId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates((prev) => ({ ...prev, [elementId]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [elementId]: false }));
      }, 2000);
    }).catch(err => {
      console.error("Không thể sao chép văn bản: ", err);
    });
  };

  // Copy seluruh Blueprint ke Clipboard formatted as markdown
  const handleCopyFullBlueprint = () => {
    if (!blueprint) return;

    const mdText = `
# BẢN VERSE KIẾN TRÚC GAME: ${blueprint.gameName.toUpperCase()}
*Được phát triển tự động bởi Qwen & Gemini Game Architect Intellect*

## 1. Mức Độ Thử Thách & Tỷ Lệ Thành Công
- **Tỷ Lệ Thành Công Dự Kiến:** ${blueprint.successRate}%
- **Đánh Giá Toàn Thư:** ${blueprint.successFactorRationale}

## 2. Vibe Coding Prompt (Dành Cho Cursor, Bolt, Windsurf, Replit)
${blueprint.vibePrompt}

## 3. Khuyến Nghị Hệ Thống Backend & Cấu Trúc Cơ Sở Dữ Liệu
- **Hệ cơ sở đề xuất:** ${blueprint.recommendedBackend.name}
- **Lý do lựa chọn kỹ thuật:** ${blueprint.recommendedBackend.reason}
- **Thiết lập lược đồ schema dữ liệu:**
${blueprint.recommendedBackend.keySetup}

## 4. Dự Báo 4 Cột Mốc Thành Công Lớn (Milestones)
${blueprint.fourSuccesses.map((s, index) => `${index + 1}. ${s}`).join("\n")}

## 5. Dự Báo 4 Lỗi Kỹ Thuật Tiềm Ẩn & Cách Khắc Phục
${blueprint.fourErrors.map((e, index) => `${index + 1}. ${e}`).join("\n")}

## 6. Sáng Tạo Nhân Vật - Prompt Sinh Ảnh
${blueprint.fourCharacterPrompts.map((cp, index) => `### ${index + 1}. ${cp.character}
- **Prompt:** ${cp.prompt}
`).join("\n")}

## 7. Logic Chi Tiết Kỹ Thuật Cho Các Tính Năng
${blueprint.technicalLogic.map((tl, index) => `### ${index + 1}. ${tl.feature}
- **Mô tả:** ${tl.description}
- **Các bước lập trình chi tiết:**
${tl.stepByStepLogic.map((step) => `  * ${step}`).join("\n")}
`).join("\n")}

## 8. Trải Nghiệm Nguyên Bản Đón Nhận Cảm Hứng
- **Game gốc tương đồng:** ${blueprint.originalGameReference.name}
- **Tổng quan ý nghĩa:** ${blueprint.originalGameReference.description}
- **Cơ chế đặc biệt cần lưu ý:** ${blueprint.originalGameReference.gameplayMechanics}
    `;

    handleCopyToClipboard(mdText.trim(), "full-blueprint");
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-[#e2e8f0] pb-24 selection:bg-purple-600 selection:text-white">
      {/* Decorative cosmic background highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-fuchsia-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3" id="company-logo">
            <span className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg ring-1 ring-white/10 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white animate-pulse" />
            </span>
            <div>
              <h1 className="font-display font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-400">
                GENESIS ARCHITECT
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                Qwen AI & Gemini Multi-LLM Hybrid Core
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>Hệ Thống Sẵn Sàng</span>
            </span>
            <span className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-900/50 text-purple-300">
              Chế Độ Vibe Coding Pro
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Intro Banner */}
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-[#18112d] via-[#0d142c] to-[#080d19] p-6 lg:p-8 border border-purple-500/15 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-white">
            <Cpu className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4 font-mono">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Công Cụ Kiến Tạo Bản Vẽ Game Đỉnh Cao
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-2">
              Thiết Kế Cấu Trúc Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Siêu Chi Tiết</span> Cho AI Vibe Coding
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Chỉ cần nhập tên ý tưởng game của bạn. Hệ thống máy chủ sẽ kết hợp khả năng suy luận logic sâu sắc từ mô hình ngôn ngữ cao cấp hàng đầu để xuất ra từ tỉ lệ khả thi, prompt chuyên biệt dành riêng khi code tự biên tự diễn (vibe coding), sơ đồ cấu trúc cơ sở dữ liệu backend, cho tới thuật toán xử lý mã hóa game loop chi tiết nhằm đảm bảo game chạy mượt mà ngay tăp lự.
            </p>

            {/* Quick Presets Carousel */}
            <div>
              <p className="text-xs text-slate-500 font-mono mb-3 uppercase tracking-wider flex items-center">
                <Lightbulb className="w-3 h-3 text-amber-400 mr-1" /> Lựa chọn nhanh ý tưởng mẫu phổ biến:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PRESET_IDEAS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleApplyPreset(preset)}
                    className="text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/30 transition-all cursor-pointer group"
                  >
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-400 truncate">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{preset.genre}</p>
                    <p className="text-[10px] text-purple-500/70 font-mono mt-1">{preset.artStyle}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Input Form & Config Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm self-start">
            <h3 className="text-base font-display font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Cấu Hình Game Thiết Kế</span>
              <Gamepad2 className="w-4 h-4 text-purple-400" />
            </h3>

            <form onSubmit={handleGenerateBlueprint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                  Tên Game Muốn Tạo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cyberpunk Tetris, Ninja Maze Runner..."
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full text-sm px-4 py-3 bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-slate-600 transition-all outline-none"
                  id="game-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                    Thể Loại Game
                  </label>
                  <input
                    type="text"
                    placeholder="RPG, Casual, Platformer"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                    Mỹ Thuật Đồ Họa
                  </label>
                  <input
                    type="text"
                    placeholder="Pixel Art, Neon, 3D Canvas"
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                  Nền Tảng Hướng Tới
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white transition-all outline-none"
                >
                  <option value="Trình duyệt Web (HTML5/Vite/ESM)">Trình duyệt Web (HTML5/Vite/ESM)</option>
                  <option value="Ứng Dụng Di Động (iOS & Android)">Ứng Dụng Di Động (iOS & Android)</option>
                  <option value="PC Offline Desktop Game (Electron/C#)">PC Offline Desktop Game (Electron/C#)</option>
                  <option value="Đa Nền Tảng (Cross-platform Web/Mobile)">Đa Nền Tảng (Cross-platform Web/Mobile)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5 font-mono">
                  Chi Tiết Đặc Trưng Riêng (Ý tưởng, tính năng đặc biệt)
                </label>
                <textarea
                  rows={4}
                  placeholder="Mô tả cụ thể cách chơi hoặc cơ chế đặc trưng mà bạn mong muốn ví dụ: Có điểm số kỷ lục lưu trữ, các quái vật rơi ngẫu nhiên, hoặc nhịp nhạc sôi động..."
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-slate-600 transition-all outline-none resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {apiSuccessMsg && (
                <div className="p-3 bg-green-950/30 border border-green-500/20 rounded-xl text-xs text-green-300 flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5" />
                  <span>{apiSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                id="btn-generate"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Hệ Thống Đang Tính Toán Sâu...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-200" />
                    <span>Lập Bản Vẽ Kiến Trúc Game</span>
                  </>
                )}
              </button>
            </form>

            {/* Note on Vibe Coding */}
            <div className="mt-6 pt-5 border-t border-slate-900 text-[11px] text-slate-500 leading-relaxed font-mono">
              <span className="font-bold text-slate-400">💡 Gợi Ý Lập Trình:</span> Khi sao chép prompt AI Vibe Coding bên cạnh, bạn chỉ việc ném thẳng vào ô chat của Cursor, Windsurf, Bolt.new để ứng dụng tự động viết trọn vẹn khung code xương sườn của trò chơi.
            </div>
          </div>

          {/* Results Output View */}
          <div className="lg:col-span-8 space-y-6">
            {!blueprint && !loading && (
              <div className="h-[480px] rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/20 flex flex-col items-center justify-center text-center p-8 backdrop-blur-2xs">
                <div className="p-4 bg-slate-900/40 rounded-full border border-slate-800/60 mb-4 animate-bounce">
                  <Compass className="w-10 h-10 text-slate-600" />
                </div>
                <h4 className="font-display text-lg font-semibold text-slate-300 mb-1">
                  Chưa Có Bản Kiến Trúc Nào Được Lập
                </h4>
                <p className="text-slate-500 text-sm max-w-md">
                  Vui lòng chọn một ý tưởng game mẫu phía trên hoặc tự nhập thông tin vào bảng cấu hình game bên trái rồi nhấn nút <strong className="text-purple-400">Lập Bản Vẽ Kiến Trúc Game</strong> để bắt đầu.
                </p>
              </div>
            )}

            {/* Loading skeleton animation */}
            {loading && (
              <div className="space-y-6 animate-pulse">
                <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="h-6 w-1/3 bg-slate-800 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="h-20 bg-slate-800 rounded-xl"></div>
                    <div className="h-20 bg-slate-800 rounded-xl"></div>
                    <div className="h-20 bg-slate-800 rounded-xl"></div>
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
                  <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
                  <div className="h-24 bg-slate-800 rounded-xl"></div>
                </div>
                <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="h-6 w-1/2 bg-slate-800 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-slate-800 rounded-xl"></div>
                    <div className="h-32 bg-slate-800 rounded-xl"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Rich Content */}
            {blueprint && (
              <div className="space-y-8 animate-fade-in">
                {blueprint._isFallback && (
                  <div className="p-4 bg-amber-950/40 border border-amber-500/20 rounded-2xl text-amber-300 text-xs flex items-start space-x-3 shadow-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <p className="font-bold text-sm text-semibold text-amber-200">Chế độ Mô phỏng / Offline hoạt động</p>
                      <p className="mt-1 leading-relaxed">{blueprint._fallbackReason}</p>
                    </div>
                  </div>
                )}

                {/* 1. Main Header of blueprint & Success Rate speed */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                          Bản Vẽ Toàn Diện Sẵn Sàng
                        </span>
                        <span className="text-slate-500 font-mono text-xs">• Version 1.0.4</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                        {blueprint.gameName}
                      </h2>
                      <p className="text-slate-400 text-xs font-mono">
                        Yếu tố chủ chốt: <span className="text-purple-400">{customGenre}</span> | Mỹ thuật: <span className="text-indigo-400">{artStyle}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                      {/* Success Rate Ring gauge */}
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="stroke-slate-800 fill-none"
                            strokeWidth="5"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            className="stroke-purple-500 fill-none transition-all duration-1000 ease-out"
                            strokeWidth="5"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={2 * Math.PI * 28 * (1 - (blueprint.successRate || 75) / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-mono font-extrabold text-white">
                            {blueprint.successRate}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                          Tỷ Lệ Thành Công Tạo Game
                        </h4>
                        <p className="text-xs text-slate-300 max-w-[200px] leading-relaxed">
                          Dự báo dựa trên độ phức tạp mã nguồn và cấu trúc logic.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" /> Đánh Giá Tiềm Năng & Trở Ngại Kỹ Thuật:
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-[#0c1221] p-4 rounded-xl border border-slate-900">
                      {blueprint.successFactorRationale}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleCopyToClipboard(`${blueprint.gameName}\nTỷ lệ thành công: ${blueprint.successRate}%\nĐại ý: ${blueprint.successFactorRationale}`, "meta-tab")}
                        className="flex items-center space-x-2 text-xs px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-300 font-medium transition-all"
                      >
                        {copiedStates["meta-tab"] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Đã sao chép đánh giá!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Sao chép phần Đánh Giá</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleCopyFullBlueprint}
                        className="flex items-center space-x-2 text-xs px-3.5 py-2 bg-purple-950/60 border border-purple-900/50 hover:bg-purple-900/40 rounded-lg text-purple-300 font-bold transition-all ml-auto"
                      >
                        {copiedStates["full-blueprint"] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Đã sao chép toàn bộ!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                            <span>Sao Chép Toàn Bộ Markdown Blueprint</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Custom Vibe coding Prompt Section */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="vibe-coding-block">
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-900 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-purple-500/15 rounded-md">
                        <Code2 className="w-4 h-4 text-purple-400" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">
                          Vibe Coding Prompt Cho AI
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">Dùng cho: Cursor, Bolt, Windsurf, Claude Code</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyToClipboard(blueprint.vibePrompt, "vibe-prompt")}
                      className="flex items-center space-x-1.5 text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all font-mono"
                    >
                      {copiedStates["vibe-prompt"] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Đã lưu!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6 bg-slate-950 font-mono text-xs text-purple-300/90 leading-relaxed overflow-x-auto relative group">
                    <pre className="whitespace-pre-wrap max-h-72 overflow-y-auto block p-4 bg-[#0a0f1d] rounded-xl border border-slate-900 text-[11px]">
                      {blueprint.vibePrompt}
                    </pre>
                    <div className="absolute bottom-4 right-4 bg-slate-900/90 px-2 py-1 rounded text-[10px] text-slate-400 border border-slate-800">
                      Markdown Plaintext
                    </div>
                  </div>
                </div>

                {/* 3. Recommended Backend Section */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="backend-recommendation">
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-900 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-blue-500/15 rounded-md">
                        <Database className="w-4 h-4 text-blue-400" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">
                          Kiến Trúc Backend & Lưu Trữ Đề Xuất
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">Giải pháp quản lý dữ liệu hiệu quả cao</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyToClipboard(`Backend Đề xuất: ${blueprint.recommendedBackend.name}\nLý do: ${blueprint.recommendedBackend.reason}\nSơ đồ bảng: \n${blueprint.recommendedBackend.keySetup}`, "backend-info")}
                      className="flex items-center space-x-1.5 text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all font-mono"
                    >
                      {copiedStates["backend-info"] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Đã lưu backend!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6 space-y-4">
                      <div>
                        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block">Công nghệ cốt lõi khuyến nghị</span>
                        <h4 className="text-lg font-bold text-white mt-1 border-l-2 border-indigo-500 pl-2">
                          {blueprint.recommendedBackend.name}
                        </h4>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider block">Lý do chọn phương án kỹ thuật này</span>
                        <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                          {blueprint.recommendedBackend.reason}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-6 bg-[#0a0f1d] border border-slate-900 rounded-xl p-4">
                      <span className="text-xs text-indigo-400 font-mono uppercase tracking-wider block mb-2 font-semibold">
                        Lược Đồ Bản Bản Cấu Trúc Bảng Dữ Liệu:
                      </span>
                      <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre font-medium overflow-x-auto">
                        {blueprint.recommendedBackend.keySetup}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* 4. Predictions: 4 successes & 4 mistakes split layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Successes list */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="successes-card">
                    <div className="p-4 bg-[#0a121d] border-b border-slate-900 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-sm font-bold text-slate-200">4 Cột Mốc Thành Công Rực Rỡ</h4>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(blueprint.fourSuccesses.map((s, i) => `${i+1}. ${s}`).join("\n"), "success-copy")}
                        className="p-1 px-2.5 text-[10px] sm:text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-850 transition-all font-mono"
                      >
                        {copiedStates["success-copy"] ? "Đã chép" : "Sao chép"}
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      {blueprint.fourSuccesses.map((success, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm p-2.5 rounded-lg bg-emerald-950/10 border border-emerald-950/20">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono">
                            {index + 1}
                          </span>
                          <p className="text-slate-300 leading-normal">{success}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fallbacks Error list */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="errors-card">
                    <div className="p-4 bg-[#140e15] border-b border-slate-900 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-200 font-display">4 Lỗi Lớn Kèm Nhắc Nhở Tránh Thất Bại</h4>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(blueprint.fourErrors.map((e, i) => `${i+1}. ${e}`).join("\n"), "error-copy")}
                        className="p-1 px-2.5 text-[10px] sm:text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-850 transition-all font-mono"
                      >
                        {copiedStates["error-copy"] ? "Đã chép" : "Sao chép"}
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      {blueprint.fourErrors.map((errorMsg, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm p-2.5 rounded-lg bg-red-950/10 border border-red-950/25">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-500/10 text-red-400 text-xs font-bold font-mono">
                            {index + 1}
                          </span>
                          <p className="text-slate-300 leading-normal">{errorMsg}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. 4 character image prompts */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="character-prompts-block">
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-900 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-purple-500/15 rounded-md">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">
                          Bản Vẽ Nghệ Thuật - 4 Prompts Sinh Ảnh Nhân Vật
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">Sử dụng trên: Midjourney, DALL-E, Bing Image Creator, Leonardo AI</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyToClipboard(blueprint.fourCharacterPrompts.map((cp) => `Vai trò: ${cp.character}\nPrompt: ${cp.prompt}`).join("\n\n"), "chars-copy")}
                      className="flex items-center space-x-1.5 text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all font-mono"
                    >
                      {copiedStates["chars-copy"] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Đã chép 4 prompts!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép tất cả Prompt ảnh</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blueprint.fourCharacterPrompts.map((cp) => (
                      <div key={cp.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-3 relative overflow-hidden group">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-800/45 font-mono font-medium">
                              {cp.character}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-300 mt-3 p-3 bg-slate-950 rounded-lg border border-slate-900 leading-relaxed block overflow-y-auto h-24 whitespace-normal break-all">
                            {cp.prompt}
                          </p>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleCopyToClipboard(cp.prompt, `char-${cp.id}`)}
                            className="flex items-center space-x-1 text-[11px] font-mono px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-purple-300 rounded border border-slate-800 hover:border-purple-500/20 transition-all"
                          >
                            {copiedStates[`char-${cp.id}`] ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-green-400">Đã chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Sao chép prompt này</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Technical features algorithm logic step-by-step detail */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="tech-features-block">
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-900 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-indigo-500/15 rounded-md">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">
                          Mô Tả Logic Kỹ Thuật Chi Tiết Cho Các Tính Năng Core
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">Tài liệu phân hệ giải thuật lập trình chính xác</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyToClipboard(blueprint.technicalLogic.map((tl) => `Tính năng: ${tl.feature}\nMô tả: ${tl.description}\nCác bước xử lý logic:\n${tl.stepByStepLogic.map((s, idx) => `  * ${s}`).join("\n")}`).join("\n\n"), "tech-all")}
                      className="flex items-center space-x-1.5 text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all font-mono"
                    >
                      {copiedStates["tech-all"] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Đã chép toàn bộ logic!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép tất cả logic game</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {blueprint.technicalLogic.map((tl, index) => (
                      <div key={tl.id || index} className="p-5 bg-slate-900/40 rounded-xl border border-slate-850 space-y-3 hover:border-indigo-500/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                              MÃ CODE MODULE: MODULE_{tl.id ? tl.id.toUpperCase().replace("-", "_") : `GAME_CORE_${index}`}
                            </span>
                            <h4 className="text-sm font-bold text-white font-display">
                              {tl.feature}
                            </h4>
                          </div>

                          <button
                            onClick={() => handleCopyToClipboard(`Tính năng: ${tl.feature}\nMô tả: ${tl.description}\nChi tiết: ${tl.stepByStepLogic.join(", ")}`, `tech-single-${index}`)}
                            className="p-1 px-2 text-[10px] bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 rounded font-mono"
                          >
                            {copiedStates[`tech-single-${index}`] ? "Đã chép" : "Chép đơn"}
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 italic">
                          {tl.description}
                        </p>

                        <div className="mt-2 space-y-1.5">
                          <h5 className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-widest block">
                            Thuật toán hoạt động từng bước xử lý:
                          </h5>
                          <ol className="space-y-1.5" id={`logic-steps-${index}`}>
                            {tl.stepByStepLogic.map((step, stepId) => (
                              <li key={stepId} className="text-xs text-slate-300 flex items-start space-x-2">
                                <span className="text-indigo-400 font-mono font-bold whitespace-nowrap pt-0.5">•</span>
                                <span className="leading-relaxed">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Inspiration & original game reference */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-start justify-between gap-6" id="original-game-block">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Gamepad2 className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-base font-bold text-white font-display">
                        Phân Khúc Cảm Hứng & Đối Chiếu Game Gốc:
                      </h4>
                    </div>

                    <p className="text-sm font-semibold text-slate-200">
                      Tên game gốc truyền cảm hứng: <span className="text-purple-400">{blueprint.originalGameReference.name}</span>
                    </p>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {blueprint.originalGameReference.description}
                    </p>

                    <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-850">
                      <p className="text-xs font-mono text-emerald-400">
                        <span className="font-bold text-slate-400">Cơ chế gameplay chính cốt lõi:</span> {blueprint.originalGameReference.gameplayMechanics}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyToClipboard(`Game mẫu: ${blueprint.originalGameReference.name}\nChi tiết: ${blueprint.originalGameReference.description}\nCơ chế gameplay: ${blueprint.originalGameReference.gameplayMechanics}`, "reference-copy")}
                    className="flex-shrink-0 flex items-center space-x-1.5 text-xs px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-all font-mono self-end md:self-start"
                  >
                    {copiedStates["reference-copy"] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Đã chép game gốc!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Sao chép nguồn cảm hứng</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 bg-[#0a0f1d]/90 border-t border-slate-800/80 backdrop-blur-md z-40 text-center">
        <p className="text-[10.5px] text-slate-500 font-mono tracking-wider">
          Mô hình lai xử lý Qwen Model & Gemini Studio Engine • Được thiết kế tinh tế với 100% sự tối giản & tiện ích cho Developer Việt Nam.
        </p>
      </footer>
    </div>
  );
}
