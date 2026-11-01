import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(pluginDir, "skills");
const agentsDir = path.resolve(pluginDir, "agents");

export const SkillPlugin = async () => ({
  config: async (config) => {
    config.skills = config.skills || {};
    config.skills.paths = config.skills.paths || [];
    if (!config.skills.paths.includes(skillsDir)) {
      config.skills.paths.push(skillsDir);
    }

    // Pastikan berkas agent tersinkronisasi ke direktori global OpenCode
    try {
      const home = process.env.USERPROFILE || process.env.HOME;
      if (home) {
        const targetAgentsDir = path.join(home, ".config", "opencode", "agents");
        if (!fs.existsSync(targetAgentsDir)) {
          fs.mkdirSync(targetAgentsDir, { recursive: true });
        }
        if (fs.existsSync(agentsDir)) {
          for (const file of fs.readdirSync(agentsDir)) {
            if (file.endsWith(".md")) {
              const src = path.join(agentsDir, file);
              const dest = path.join(targetAgentsDir, file);
              fs.copyFileSync(src, dest);
            }
          }
        }
      }
    } catch {
      // Abaikan jika permission terbatas
    }
  },
});

export default SkillPlugin;
