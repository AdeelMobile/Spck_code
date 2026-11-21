// ==========================================
// 6. VERIFICATION FORM & SUBMIT
// ==========================================

function showVerifyForm(p) {
  verifyFrontImg = '';
  verifyBackImg = '';

  let html = `
    <div style="text-align:center; margin-bottom:15px;">
      <h3 style="margin:0; color:var(--pri);">Verification Form</h3>
      <p style="color:var(--mute); font-size:12px;">For: ${esc(p.variant)}</p>
    </div>

    <label>Customer Name *</label>
    <input id="v_name" placeholder="Enter full name">

    <label>WhatsApp Number *</label>
    <input id="v_phone" placeholder="03xx-xxxxxxx">

    <label>CNIC Number</label>
    <input id="v_cnic" placeholder="12345-1234567-1">

    <label style="margin-top:10px; display:block;">ID Card Front Image</label>
    <div class="img-upload-box" style="border: 2px dashed var(--line); padding: 15px; text-align: center; border-radius: 10px; background: var(--bg); margin-bottom: 15px; position: relative;">
      <span style="color:var(--pri); font-weight:600; font-size:14px;">📷 Click to Upload Front Image</span>
      <input type="file" accept="image/*" onchange="resizeAndPreview(this, 'front')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
    </div>
    <img id="preview_front" style="width: 100%; height: 120px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: 8px; margin-top: 10px; display: none;">

    <label style="margin-top:10px; display:block;">ID Card Back Image</label>
    <div class="img-upload-box" style="border: 2px dashed var(--line); padding: 15px; text-align: center; border-radius: 10px; background: var(--bg); margin-bottom: 15px; position: relative;">
      <span style="color:var(--pri); font-weight:600; font-size:14px;">📷 Click to Upload Back Image</span>
      <input type="file" accept="image/*" onchange="resizeAndPreview(this, 'back')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
    </div>
    <img id="preview_back" style="width: 100%; height: 120px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: 8px; margin-top: 10px; display: none;">

    <label>Have you taken any online loan?</label>
    <select id="v_loan">
      <option value="No">No</option>
      <option value="Yes">Yes</option>
    </select>

    <div style="margin-top:20px; display:flex; gap:10px;">
      <button class="btn" style="flex:1;" onclick="submitVerification('${esc(p.variant)}')">Submit Form</button>
      <button class="btn sec" onclick="closeModal()">Cancel</button>
    </div>
  `;
  
  document.getElementById('modalTitle').innerText = 'Customer Verification';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('infoModal').classList.add('open');
}

function resizeAndPreview(input, type) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxSize = 600;
      if (width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.7);
      
      if(type === 'front') verifyFrontImg = base64Image;
      if(type === 'back') verifyBackImg = base64Image;

      const previewId = type === 'front' ? 'preview_front' : 'preview_back';
      const previewEl = document.getElementById(previewId);
      if(previewEl) {
        previewEl.src = base64Image;
        previewEl.style.display = 'block';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function submitVerification(productName) {
  const name = document.getElementById('v_name').value.trim();
  const phone = document.getElementById('v_phone').value.trim();
  const cnic = document.getElementById('v_cnic').value.trim();
  const loan = document.getElementById('v_loan').value;

  if(!name || !phone) {
    alert('Name and WhatsApp number are required.');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const agentUsername = urlParams.get('user') || 'guest';

  try {
    const { error } = await supabaseClient.from('verifications').insert([{
      name: name,
      phone: phone,
      cnic: cnic,
      front_img: verifyFrontImg,
      back_img: verifyBackImg,
      loan_taken: loan,
      product: productName,
      status: 'Pending',
      added_by: agentUsername
    }]);

    if (error) throw error;

    closeModal();
    alert('Verification request submitted successfully! Our team will contact you.');
    
    verifyFrontImg = '';
    verifyBackImg = '';

  } catch (err) {
    alert('Error submitting verification: ' + err.message);
    console.error(err);
  }
}