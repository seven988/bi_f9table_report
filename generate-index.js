const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

const IGNORE_DIRS = new Set([".git", ".github", ".idea", "node_modules"]);
const IGNORE_FILES = new Set(["index.html", "generate-index.js", "README.md"]);

function scan(dir, isChild = false) {
    let html = isChild ? '<ul class="folder-children">' : '<ul>';
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));

    for (const file of files) {
        if (file.isDirectory()) {
            if (IGNORE_DIRS.has(file.name)) continue;
            html += `
<li class="folder">
    <strong>📁 ${file.name}</strong>
    ${scan(path.join(dir, file.name), true)}
</li>`;
        } else {
            if (!file.name.endsWith(".html")) continue;
            if (IGNORE_FILES.has(file.name)) continue;
            const full = path.join(dir, file.name);
            const relative = path.relative(ROOT, full).replace(/\\/g, "/");
            const title = file.name.replace(/\.html$/, "");
            html += `
<li>📄 <a href="${encodeURI(relative)}">${title}</a></li>`;
        }
    }
    html += "</ul>";
    return html;
}

// ✅ 关键：生成文档树
const body = scan(ROOT);

const page = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>文档导航</title>
<style>
body { font-family: "Microsoft YaHei",sans-serif; margin:40px; background:#f5f5f5; }
h1 { text-align:center; }
ul { list-style:none; padding-left:25px; }
li { margin:8px 0; }
a { color:#1677ff; text-decoration:none; }
a:hover { text-decoration:underline; }
strong { font-size:18px; }
.folder > strong { cursor: pointer; user-select: none; }
.folder-children { display: block; }
</style>
</head>
<body>
<h1>📚 文档导航</h1>
${body}
<script>
(function() {
    document.querySelectorAll('.folder').forEach(folder => {
        folder.addEventListener('click', function(e) {
            if (e.target.closest('a')) return;
            const children = this.querySelector('.folder-children');
            if (!children) return;
            if (children.contains(e.target)) return;
            const display = window.getComputedStyle(children).display;
            children.style.display = display === 'none' ? 'block' : 'none';
        });
    });
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "index.html"), page, "utf8");
console.log("index.html 已生成");