import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Toast } from "antd-mobile";
import { LeftOutline, FileOutline } from "antd-mobile-icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import NavbarMobile from './navbarMobile';
import { API_BASE } from "../../config/api";

const InvoiceMobile = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/invoice/${orderId}`)
      .then(response => {
        if (response.data && Array.isArray(response.data.items)) {
          setInvoiceData(response.data);
        } else {
          Toast.show({ icon: 'fail', content: 'Invoice format error' });
          setInvoiceData({ items: [] });
        }
      })
      .catch(error => {
        console.error("Error fetching invoice:", error);
        Toast.show({ icon: 'fail', content: 'Error fetching invoice' });
        setInvoiceData({ items: [] });
      });
  }, [orderId]);

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, (canvas.height * 80) / canvas.width],
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`Receipt_${orderId}.pdf`);
  };

  if (!invoiceData) {
    return <p style={{ textAlign: 'center', padding: 20 }}>Loading invoice...</p>;
  }

  const computedSubtotal = invoiceData.items?.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  const discountAmount = parseFloat(invoiceData.discount_applied || 0);
  const finalTotal = computedSubtotal - discountAmount;

  const formattedDate = invoiceData.created_date_time
    ? new Date(invoiceData.created_date_time).toLocaleString("en-MY", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
    : "Date not available";
  return (
    <div
      className="invoice-container"
      style={{
        minHeight: "100vh",
        background: 'transparent',
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        overflowX: 'hidden',
        alignItems: "center",
        width: '100vw'
      }}
    >
      <div
        className="invoice-content"
        ref={invoiceRef}
        style={{
          width: "100%",
          maxWidth: 'none',
          background: "#fff",
          borderRadius: 10,
          padding: 16,
          fontFamily: "'Courier New', Courier, monospace",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <h3 style={{
          textAlign: "center",
          fontSize: "16px",
          wordBreak: "break-word",
          lineHeight: "1.3",
        }}>
          ★ Restaurant HengOngHuat ★
        </h3>
        <p style={{ textAlign: "center", fontSize: "12px" }}>
          Jalan Universiti, 31900 Kampar, Perak
        </p>
        <p style={{ textAlign: "center", fontSize: "12px" }}>
          Tel: +60 10-8143000
        </p>

        <p><strong>Receipt #{orderId}</strong></p>
        <p>{formattedDate}</p>

        <hr />
        <p><strong>Served by:</strong> Jarod Lim</p>
        <hr />

        {/* Items Table */}
        <table style={{ width: "100%", fontSize: "13px", borderCollapse: 'collapse', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th align="left">Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td align='left' style={{ verticalAlign: 'top' }}>{item.name}</td>
                  <td align="center" style={{ verticalAlign: 'top' }}>{item.quantity}</td>
                  <td align="center" style={{ verticalAlign: 'top' }}>RM{parseFloat(item.price).toFixed(2)}</td>
                  <td align="center" style={{ verticalAlign: 'top' }}>RM{parseFloat(item.total_price).toFixed(2)}</td>
                </tr>

                {item.remarks && (
                  <tr>
                    <td align='left' colSpan={4} style={{ paddingLeft: 10, fontSize: '12px', color: '#555' }}>
                      - {item.remarks}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <hr/>
        <p><strong>Subtotal:</strong> RM{computedSubtotal.toFixed(2)}</p>
        {discountAmount > 0 && (
          <p style={{ color: "green" }}><strong>Discount:</strong> -RM{discountAmount.toFixed(2)}</p>
        )}
        <p style={{ fontWeight: "bold" }}><strong>Total Payable:</strong> RM{finalTotal.toFixed(2)}</p>
        <hr />
        <p style={{ textAlign: "center", fontSize: "12px" }}>
          Thank you for dining with us!<br />
          ★ Please come again! ★
        </p>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8, width: "100%", maxWidth: 400 }}>
        <Button block color="primary" fill="solid" onClick={handleDownloadPDF}>
          <FileOutline /> Download
        </Button>
        <Button block color="default" fill="outline" onClick={() => navigate("/menuItemsMobile")}>
          <LeftOutline /> Back
        </Button>
      </div>

      <NavbarMobile />
    </div>
  );
};

export default InvoiceMobile;
