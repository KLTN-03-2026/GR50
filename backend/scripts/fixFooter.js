const fs = require('fs');
const path = require('path');

const filePath = 'd:\\WEB_ĐẶT_LỊCH_KHÁM_BỆNH\\web_12\\frontend\\src\\pages\\LandingPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add states
if (!content.includes('showInfoDialog')) {
    content = content.replace(
        'useEffect(() => {',
        'const [showInfoDialog, setShowInfoDialog] = useState(false);\n  const [infoContent, setInfoContent] = useState({ title: \'\', content: \'\' });\n\n  useEffect(() => {'
    );
}

// Add openInfo function
if (!content.includes('const openInfo =')) {
    content = content.replace(
        'return (',
        'const openInfo = (title, content) => {\n    setInfoContent({ title, content });\n    setShowInfoDialog(true);\n  };\n\n  return ('
    );
}

// Update service links
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Khám chuyên khoa</a></li>',
    '<li><a href="#chuyen-khoa" className="hover:text-cyan-400">Khám chuyên khoa</a></li>'
);
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Khám từ xa</a></li>',
    '<li><button onClick={() => navigate(\'/services/remote-examination\')} className="hover:text-cyan-400">Khám từ xa</button></li>'
);
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Xét nghiệm</a></li>',
    '<li><button onClick={() => navigate(\'/services/medical-testing\')} className="hover:text-cyan-400">Xét nghiệm</button></li>'
);
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Gói phẫu thuật</a></li>',
    '<li><button onClick={() => navigate(\'/services/surgery\')} className="hover:text-cyan-400">Gói phẫu thuật</button></li>'
);

// Update support links
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Câu hỏi thường gặp</a></li>',
    '<li><button onClick={() => openInfo(\'Câu hỏi thường gặp\', \'Hệ thống hỗ trợ đặt lịch khám online 24/7. Bạn có thể chọn bác sĩ, chuyên khoa và thời gian phù hợp.\')} className="hover:text-cyan-400 text-left">Câu hỏi thường gặp</button></li>'
);
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Hướng dẫn đặt lịch</a></li>',
    '<li><button onClick={() => openInfo(\'Hướng dẫn đặt lịch\', \'B1: Chọn bác sĩ hoặc cơ sở y tế. B2: Chọn giờ khám. B3: Điền thông tin bệnh nhân. B4: Xác nhận và thanh toán (nếu có).\')} className="hover:text-cyan-400 text-left">Hướng dẫn đặt lịch</button></li>'
);
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Chính sách</a></li>',
    '<li><button onClick={() => openInfo(\'Chính sách bảo mật\', \'Chúng tôi cam kết bảo mật tuyệt đối thông tin y tế và dữ liệu cá nhân của người dùng theo tiêu chuẩn quốc tế.\')} className="hover:text-cyan-400 text-left">Chính sách</button></li>'
);
content = content.replace(
    '<li><a href="#" className="hover:text-cyan-400">Điều khoản</a></li>',
    '<li><button onClick={() => openInfo(\'Điều khoản sử dụng\', \'Người dùng cần cung cấp thông tin chính xác khi đặt lịch. Mọi hành vi spam sẽ bị khóa tài khoản vĩnh viễn.\')} className="hover:text-cyan-400 text-left">Điều khoản</button></li>'
);

// Add Dialog component at the end
if (!content.includes('setShowInfoDialog(false)')) {
    const dialogCode = `
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-cyan-600">{infoContent.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-gray-700 leading-relaxed">
            {infoContent.content.split('\\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowInfoDialog(false)} className="bg-cyan-600 hover:bg-cyan-700">Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>`;
    
    content = content.replace('</div>\n  );\n}', dialogCode + '\n  );\n}');
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated LandingPage.jsx');
