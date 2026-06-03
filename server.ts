import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI on the server
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY", // Handle local environments safely
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Definition schema for target Response matching types.ts
const gameBlueprintSchema = {
  type: Type.OBJECT,
  properties: {
    gameName: {
      type: Type.STRING,
      description: "Tên chính thức hoặc phiên bản của tựa game đang được kiến trúc hóa."
    },
    successRate: {
      type: Type.INTEGER,
      description: "Tỷ lệ dự đoán dự án tạo game thành công ở thang 10 đến 99 (số nguyên)."
    },
    successFactorRationale: {
      type: Type.STRING,
      description: "Giải thích chi tiết bằng tiếng Việt lý do tại sao đạt được phần trăm tỷ lệ thành công trên (dựa trên mức độ phức tạp, đồ họa, độ khó code)."
    },
    vibePrompt: {
      type: Type.STRING,
      description: "Một Prompt siêu chi tiết và bài bản viết rõ bằng tiếng Việt dành riêng cho AI Vibe Coding (Cursor, Bolt.new, Windsurf, Replit) để bắt đầu xây dựng cốt lõi game, giao diện, và cơ chế chuyển đổi màn chơi."
    },
    recommendedBackend: {
      type: Type.OBJECT,
      description: "Khuyến nghị Backend và lưu trữ phù hợp nhất cho mô hình game này.",
      properties: {
        name: { type: Type.STRING, description: "Tên backend khuyên dùng (ví dụ: Firebase Firestore, Express NodeJS, Supabase, LocalStorage, SQLite)." },
        reason: { type: Type.STRING, description: "Giải thích kỹ thuật chi tiết tại sao giải pháp backend này phù hợp với game." },
        keySetup: { type: Type.STRING, description: "Cấu trúc tổ chức bảng dữ liệu hoặc sơ đồ lưu trữ dạng text để lập trình viên áp dụng ngay." }
      },
      required: ["name", "reason", "keySetup"]
    },
    fourSuccesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Danh sách chính xác 4 cột mốc thành công lớn hoặc tính năng vượt bậc có thể đạt được khi xuất bản game này."
    },
    fourErrors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Danh sách chính xác 4 lỗi kỹ thuật tiềm ẩn, bug logic, hoặc lỗi đồng bộ loop game có khả năng cực cao xảy ra kèm cách phòng tránh."
    },
    fourCharacterPrompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Mã định danh duy nhất ngắn gọn" },
          character: { type: Type.STRING, description: "Tên hoặc vai trò nhân vật (ví dụ: Chiến binh chính, Trùm rồng cuối, Thú nuôi phụ trợ)" },
          prompt: { type: Type.STRING, description: "Prompt bằng tiếng Anh cực kỳ chi tiết dùng cho Midjourney, DALL-E 3 hoặc Leonardo AI để tạo hình ảnh nhân vật chất lượng 4D, game art, isometric hoặc pixel art." }
        },
        required: ["id", "character", "prompt"]
      },
      description: "Chính xác 4 prompt tạo hình nhân vật độc đáo của trò chơi."
    },
    technicalLogic: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Mã logic ID ngắn gọn" },
          feature: { type: Type.STRING, description: "Tên tính năng cốt lõi (ví dụ: Trí tuệ ảo quái vật, Thuật toán sinh bản đồ vô tận, Quản lý lực vạn vật và va chạm)" },
          description: { type: Type.STRING, description: "Mô tả tổng quan kỹ thuật tiếng Việt" },
          stepByStepLogic: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Các bước xử lý logic lập trình chi tiết nhất bằng tiếng Việt (Bước 1, Bước 2, Bước 3...)"
          }
        },
        required: ["id", "feature", "description", "stepByStepLogic"]
      },
      description: "Mô tả chi tiết logic kỹ thuật chuyên sâu cho ít nhất 3 hoặc 4 tính năng game chủ chốt giúp lập trình viên hiện thực hóa."
    },
    originalGameReference: {
      type: Type.OBJECT,
      description: "Thông tin về game gốc hoặc game mẫu tương tự truyền cảm hứng.",
      properties: {
        name: { type: Type.STRING, description: "Tên game gốc nổi tiếng" },
        description: { type: Type.STRING, description: "Sơ lược lịch sử và ảnh hưởng của tựa game gốc đó bằng tiếng Việt." },
        gameplayMechanics: { type: Type.STRING, description: "Các cơ chế lối chơi nguyên bản quan trọng cần lưu ý bằng tiếng Việt." }
      },
      required: ["name", "description", "gameplayMechanics"]
    }
  },
  required: [
    "gameName",
    "successRate",
    "successFactorRationale",
    "vibePrompt",
    "recommendedBackend",
    "fourSuccesses",
    "fourErrors",
    "fourCharacterPrompts",
    "technicalLogic",
    "originalGameReference"
  ]
};

// POST Generation Endpoint
app.post("/api/generate", async (req, res) => {
  const { gameName, customGenre, targetPlatform, artStyle, customDetails } = req.body;

  if (!gameName || typeof gameName !== "string" || gameName.trim() === "") {
    return res.status(400).json({ error: "Tên trò chơi là bắt buộc và không được để trống." });
  }

  const isMockKey = !apiKey || apiKey === "MOCK_KEY" || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("MY_GEMINI") || apiKey.trim() === "";
  if (isMockKey) {
    console.warn("GEMINI_API_KEY has default mock value. Using mock response.");
    return res.json({
      ...getMockBlueprint(gameName, customGenre || "RPG", artStyle || "Pixel Art"),
      _isFallback: true,
      _fallbackReason: "Hệ thống đang sử dụng khoá API mẫu mặc định. Bản thiết kế dưới đây là cấu trúc mẫu có sẵn phù hợp với ý tưởng của bạn. Bạn vẫn có thể sao chép tất cả prompt và logic hoàn toàn bình thường!"
    });
  }

  try {
    const promptInstructions = `
Bạn là "Qwen & Gemini Multi-LLM Game Architect" - một siêu công cụ AI chuyên hỗ trợ thiết kế cấu trúc game chi tiết và viết prompt hoàn hảo cho AI Vibe Coding (như Cursor, Windsurf, Bolt.new).
Người dùng muốn tạo ra trò chơi với các thông tin sau:
- Tên game: "${gameName}"
- Thể loại tùy chọn: "${customGenre || 'Không xác định'}"
- Nền tảng hướng tới: "${targetPlatform || 'Web Browser (HTML5)'}"
- Phong cách mỹ thuật nghệ thuật: "${artStyle || '2D Pixel Art'}"
- Ghi chú hoặc chi tiết bổ sung: "${customDetails || 'Không có'}"

Hãy suy luận và tạo ra kiến trúc bản dựng game toàn diện bằng tiếng Việt. Mọi trường thông tin văn bản phải viết mạch lạc, mang tính thực tế tuyệt đối, hướng dẫn chi tiết thuật toán của game thay vì nói chung chung. 
Mã hóa kết quả đầu ra thành JSON tuân thủ chính xác cấu trúc Schema được định nghĩa.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptInstructions,
      config: {
        systemInstruction: "Bạn là một AI kiến trúc sư game cao cấp chuyên thiết lập cấu trúc kỹ thuật cho game indie và game AAA. Hãy sinh thông tin cực sâu bằng tiếng Việt có cấu trúc đầy đủ, chuyên sâu.",
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: gameBlueprintSchema
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Không nhận được nội dung từ Gemini API.");
    }

    const compiledData = JSON.parse(jsonText.trim());
    return res.json(compiledData);

  } catch (error: any) {
    console.error("Generator error with Gemini. Falling back to structured mock:", error);
    const mockData = getMockBlueprint(gameName, customGenre || "RPG", artStyle || "Pixel Art");
    return res.json({
      ...mockData,
      _isFallback: true,
      _fallbackReason: `Lỗi API trực tuyến: ${error.message || error}. Đã kích hoạt mô hình lập trình ngoại tuyến tinh gọn để phục vụ ý tưởng game của bạn.`
    });
  }
});

// Fallback Mock generator for development convenience if API Key is unavailable
function getMockBlueprint(gameName: string, genre: string, art: string): any {
  return {
    gameName: gameName,
    successRate: 85,
    successFactorRationale: "Trò chơi có ý tưởng rõ ràng, cơ chế chơi quen thuộc pha trộn tính độc đáo. Với phong cách mỹ thuật " + art + " và nền tảng Web, nỗ lực phát triển được tối ưu tuyệt đối.",
    vibePrompt: `Xây dựng game ${gameName} thuộc thể loại ${genre} bằng React Vite, Tailwind CSS và Lucide React. Game cần có một vòng lặp trò chơi (game loop) sử dụng requestAnimationFrame, quản lý trạng thái điểm số cao kỷ lục trong localStorage. Đảm bảo hỗ trợ phím điều hướng mượt mà, giao diện tinh tế mang tính tương phản cao, âm thanh giả lập bằng Web Audio API khi ăn điểm hoặc va chạm sụp đổ. Hãy viết code toàn bộ trong một file đơn giản để bắt đầu chạy được.`,
    recommendedBackend: {
      name: "Firebase Firestore & Auth",
      reason: "Giúp lưu trữ điểm số cao tức thì, xếp hạng bảng vàng toàn cầu và tài khoản người dùng mà không cần cấu hình cụ thể server Node.js cồng kềnh.",
      keySetup: "Bảng leaderboards (id, userId, username, score, timestamp)\nBảng users (uid, name, email, createdAt, gamesPlayed)"
    },
    fourSuccesses: [
      "Xây dựng thành công hệ thống điều khiển mượt mà, không bị trễ khung hình trên trình duyệt.",
      "Tích hợp bảng xếp hạng theo thời gian thực khơi gợi động lực tranh đấu của game thủ.",
      "Hoàn thiện hệ thống sinh chướng ngại vật/quái vật ngẫu nhiên nâng cao độ thử thách.",
      "Tạo nên hiệu ứng tương tác vật lý sống động cùng hạt bụi hiệu ứng khi xảy ra va chạm."
    ],
    fourErrors: [
      "Rò rỉ bộ nhớ (Memory leaks) do quên dọn dẹp các sự kiện bàn phím và bộ đếm thời gian (intervals).",
      "Sai lệch tỷ lệ hiển thị trên màn hình điện thoại (Responsive Viewports) khiến chướng ngại vật lệch khỏi tầm nhìn.",
      "Trùng lặp sự kiện va chạm (Double collision triggers) khiến mất nhiều mạng liên tiếp trong cùng 1 tích tắc.",
      "Hiệu năng drop FPS khi lượng thực thể hoạt ảnh tăng cao trên màn hình nền canvas."
    ],
    fourCharacterPrompts: [
      { id: "hero", character: "Nhân vật chính (The Hero Grid)", prompt: "A 2D pixel art character of a brave explorer, equipped with a glowing blue backpack, viewed from side-scrolling perspective, gaming asset style, isolated sheet, high detail." },
      { id: "ally", character: "Thú cưng dẫn đường (Mystic Fairy)", prompt: "A glowing companion wisp floating in dark fantasy pixel art style, high contrast, vibrant green sparkles, isolated neon avatar, elegant gaming graphic." },
      { id: "enemy", character: "Quái vật bóng đêm (Shadow Creeper)", prompt: "A creepy shadowy creature with multiple red neon eyes, pixel art asset, side profile, retro vintage arcade look, dangerous boss vibes." },
      { id: "npc", character: "Thương nhân cổ xưa (The Oracle)", prompt: "Ancient sage with cosmic robes holding a starry lantern, retro GameBoy Advance detailed port portrait, pixel art face icon, medieval cyberpunk aesthetic." }
    ],
    technicalLogic: [
      {
        id: "game-loop",
        feature: "Vòng Lặp Game Khép Kín (Core Game Loop & State)",
        description: "Quản lý đồng bộ hóa thời gian vẽ khung hình và tính toán vị trí vật lý chính xác bất kể FPS của card đồ họa.",
        stepByStepLogic: [
          "Bước 1: Sử dụng requestAnimationFrame để gọi liên tục hàm chính loop().",
          "Bước 2: Tính toán delta time (thời gian chênh lệch giữa 2 khung hình liền kề) để di chuyển nhân vật đồng đều.",
          "Bước 3: Thực hiện cập nhật logic trạng thái nhân vật, chướng ngại vật, kẻ địch.",
          "Bước 4: Thực hiện xóa khung hình cũ và vẽ lại khung hình mới lên màn hình trình duyệt.",
          "Bước 5: Kiểm tra điều kiện GameOver hoặc đổi màn để dừng vòng lặp."
        ]
      },
      {
        id: "collision",
        feature: "Tính Toán Va Chạm AABB (Axis-Aligned Bounding Box)",
        description: "Phương pháp va chạm đơn giản nhưng hiệu quả cao cho mọi game 2D side-scroller hoạc platformer.",
        stepByStepLogic: [
          "Bước 1: Xác định tọa độ X, Y cùng chiều rộng (W) và chiều cao (H) cho chiếc hộp va chạm của nhân vật.",
          "Bước 2: Làm tương tự lấy tọa độ và kích thước hộp va chạm của chướng ngại vật.",
          "Bước 3: Áp dụng công thức so khớp: if (hero.x < obstacle.x + obstacle.w && hero.x + hero.w > obstacle.x && hero.y < obstacle.y + obstacle.h && hero.y + hero.h > obstacle.y) thì coi như xảy ra chạm.",
          "Bước 4: Khi xảy ra va chạm, kích hoạt giảm thanh máu hoặc dừng game tức thì.",
          "Bước 5: Tạo khoảng thời gian miễn nhiễm sát thương (invulnerability frames) ngắn để bảo vệ người chơi."
        ]
      }
    ],
    originalGameReference: {
      name: "Tựa game huyền thoại Flappy Bird & Retro Platformers",
      description: "Có xuất phát điểm vô cùng tối giản nhưng lối chơi cuốn hút cao độ nhờ áp dụng xuất sắc lý thuyết 'dễ chơi nhưng khó thành thạo' (easy to play, hard to master).",
      gameplayMechanics: "Lực hấp dẫn kéo nhân vật rơi tự do liên tục; người chơi ấn phím kích hoạt lực nhảy hướng lên trên; khoảng hở của các cột ống sinh ngẫu nhiên liên tiếp thử thách sự khéo léo."
    }
  };
}

// Vite and Serve Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Game Architect Server running on http://localhost:${PORT}`);
  });
}

startServer();
