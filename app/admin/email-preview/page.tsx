"use client";

export default function EmailPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Email Template Preview
        </h1>

        {/* Admin Email Preview */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-green-600 text-white px-6 py-3">
            <p className="font-semibold">
              📧 Admin Email - New Order Notification
            </p>
          </div>
          <div className="p-1">
            {/* ADMIN EMAIL TEMPLATE */}
            <div
              style={{
                fontFamily: "Arial, sans-serif",
                maxWidth: "900px",
                margin: "0 auto",
              }}
            >
              <h2
                style={{
                  color: "#10b981",
                  fontSize: "26px",
                  marginBottom: "25px",
                }}
              >
                🛒 New Order Received!
              </h2>

              {/* Order Summary Box */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  padding: "25px",
                  borderRadius: "10px",
                  borderLeft: "4px solid #10b981",
                  marginBottom: "30px",
                }}
              >
                <p style={{ fontSize: "15px", fontWeight: "500", margin: "0" }}>
                  Order #HAIR-123456-ABC
                </p>
                <p style={{ fontSize: "15px", margin: "10px 0 0 0" }}>
                  Total Amount:{" "}
                  <strong style={{ color: "#10b981" }}>₦47,500.00</strong>
                </p>
              </div>

              {/* Customer Information */}
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "30px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    margin: "0 0 20px 0",
                    color: "#374151",
                  }}
                >
                  👤 Customer Information
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tr>
                    <td
                      style={{
                        padding: "8px 0",
                        color: "#6b7280",
                        width: "150px",
                      }}
                    >
                      Name:
                    </td>
                    <td style={{ padding: "8px 0" }}>John Doe</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#6b7280" }}>
                      Email:
                    </td>
                    <td style={{ padding: "8px 0" }}>john@example.com</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#6b7280" }}>
                      Phone:
                    </td>
                    <td style={{ padding: "8px 0" }}>08012345678</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", color: "#6b7280" }}>
                      Location:
                    </td>
                    <td style={{ padding: "8px 0" }}>
                      12 Example Street, Ikeja, Lagos
                    </td>
                  </tr>
                </table>
              </div>

              {/* Order Details */}
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "5px",
                  borderRadius: "10px",
                  marginBottom: "30px",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "500",
                    margin: "0 0 25px 0",
                    color: "#374151",
                  }}
                >
                  📦 Order Details
                </h3>

                {/* Product 1 */}
                <div
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "5px 0 15px 0",
                    marginBottom: "15px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 15px 0",
                    }}
                  >
                    Bone Straight
                  </p>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tr>
                      <td
                        style={{
                          padding: "6px 0",
                          color: "#6b7280",
                          width: "120px",
                        }}
                      >
                        Length:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        14 inches
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Density:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        180%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Lace Size:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        6x6
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Quantity:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        2
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Price:
                      </td>
                      <td
                        style={{
                          padding: "6px 0",
                          textAlign: "right",
                          color: "#10b981",
                        }}
                      >
                        ₦90,000.00
                      </td>
                    </tr>
                  </table>
                </div>

                {/* Product 2 */}
                <div
                  style={{
                    padding: "0 0 15px 0",
                    marginBottom: "15px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 15px 0",
                    }}
                  >
                    Deep Wave
                  </p>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tr>
                      <td
                        style={{
                          padding: "6px 0",
                          color: "#6b7280",
                          width: "120px",
                        }}
                      >
                        Length:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        16 inches
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Density:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        180%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Lace Size:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        5x5
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Quantity:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        1
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Price:
                      </td>
                      <td
                        style={{
                          padding: "6px 0",
                          textAlign: "right",
                          color: "#10b981",
                        }}
                      >
                        ₦45,000.00
                      </td>
                    </tr>
                  </table>
                </div>

                {/* Totals */}
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "15px",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <table style={{ width: "100%" }}>
                    <tr>
                      <td style={{ padding: "8px 0" }}>Subtotal:</td>
                      <td style={{ textAlign: "right" }}>₦135,000.00</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0" }}>Shipping:</td>
                      <td style={{ textAlign: "right" }}>₦2,500.00</td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "15px 0 0 0",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        TOTAL:
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: "bold",
                          color: "#10b981",
                          fontSize: "18px",
                        }}
                      >
                        ₦137,500.00
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              {/* Delivery Info */}
              <div
                style={{
                  backgroundColor: "#fef3c7",
                  padding: "5px",
                  borderRadius: "2px",
                  marginBottom: "10px",
                }}
              >
                <p style={{ margin: "0" }}>
                  <strong style={{ color: "#92400e" }}>📅 Delivery:</strong>{" "}
                  Jan. 22 - Feb. 04
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Email Preview - EXACT SAME STYLING AS ADMIN */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-3">
            <p className="font-semibold">
              📧 Customer Email - Order Confirmation
            </p>
          </div>
          <div className="p-1">
            {/* CUSTOMER EMAIL TEMPLATE - IDENTICAL TO ADMIN */}
            <div
              style={{
                fontFamily: "Arial, sans-serif",
                maxWidth: "900px",
                margin: "0 auto",
              }}
            >
              <h2
                style={{
                  color: "#10b981",
                  fontSize: "26px",
                  marginBottom: "25px",
                }}
              >
                Thank you for your order! 🎉
              </h2>

              <p style={{ fontSize: "15px", marginBottom: "10px" }}>
                Hello John Doe,
              </p>
              <p style={{ fontSize: "15px", marginBottom: "25px" }}>
                We've received your order and will process it shortly.
              </p>

              {/* Order Summary Box - Same as admin */}
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  padding: "25px",
                  borderRadius: "10px",
                  borderLeft: "4px solid #10b981",
                  marginBottom: "30px",
                }}
              >
                <p style={{ fontSize: "15px", fontWeight: "500", margin: "0" }}>
                  Order #HAIR-123456-ABC
                </p>
                <p style={{ fontSize: "15px", margin: "10px 0 0 0" }}>
                  Total Amount:{" "}
                  <strong style={{ color: "#10b981" }}>₦47,500.00</strong>
                </p>
              </div>

              {/* Order Details - EXACT SAME AS ADMIN */}
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "5px",
                  borderRadius: "10px",
                  marginBottom: "30px",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "500",
                    margin: "0 0 25px 0",
                    color: "#374151",
                  }}
                >
                  Your Order Details
                </h3>

                {/* Product 1 - Same spacing as admin */}
                <div
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "5px 0 15px 0",
                    marginBottom: "15px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 15px 0",
                    }}
                  >
                    Bone Straight
                  </p>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tr>
                      <td
                        style={{
                          padding: "6px 0",
                          color: "#6b7280",
                          width: "120px",
                        }}
                      >
                        Length:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        14 inches
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Density:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        180%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Lace Size:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        6x6
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Quantity:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        2
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Price:
                      </td>
                      <td
                        style={{
                          padding: "6px 0",
                          textAlign: "right",
                          color: "#10b981",
                        }}
                      >
                        ₦90,000.00
                      </td>
                    </tr>
                  </table>
                </div>

                {/* Product 2 - Same spacing as admin */}
                <div
                  style={{
                    padding: "0 0 15px 0",
                    marginBottom: "15px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: "0 0 15px 0",
                    }}
                  >
                    Deep Wave
                  </p>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tr>
                      <td
                        style={{
                          padding: "6px 0",
                          color: "#6b7280",
                          width: "120px",
                        }}
                      >
                        Length:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        16 inches
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Density:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        180%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Lace Size:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        5x5
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Quantity:
                      </td>
                      <td style={{ padding: "6px 0", textAlign: "right" }}>
                        1
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 0", color: "#6b7280" }}>
                        Price:
                      </td>
                      <td
                        style={{
                          padding: "6px 0",
                          textAlign: "right",
                          color: "#10b981",
                        }}
                      >
                        ₦45,000.00
                      </td>
                    </tr>
                  </table>
                </div>

                {/* Totals - Same as admin */}
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "15px",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <table style={{ width: "100%" }}>
                    <tr>
                      <td style={{ padding: "8px 0" }}>Subtotal:</td>
                      <td style={{ textAlign: "right" }}>₦135,000.00</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0" }}>Shipping:</td>
                      <td style={{ textAlign: "right" }}>₦2,500.00</td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "15px 0 0 0",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        Total:
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: "bold",
                          color: "#10b981",
                          fontSize: "18px",
                        }}
                      >
                        ₦137,500.00
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              {/* Delivery Info - Same as admin */}
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "5px",
                  borderRadius: "2px",
                  marginBottom: "15px",
                }}
              >
                <p style={{ margin: "0" }}>
                  <strong style={{ color: "#374151" }}>📦 Delivery:</strong>{" "}
                  Jan. 22 - Feb. 04
                </p>
              </div>

              <p style={{ fontSize: "15px", marginBottom: "8px" }}>
                We'll notify you once your order ships.
              </p>
              <p style={{ fontSize: "15px", margin: "0" }}>
                Best regards,
                <br />
                <strong style={{ color: "#10b981" }}>HAIR Universe Team</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>✏️ Instructions:</strong> Both emails now have identical
            styling with proper spacing. Edit the HTML above to your taste. Once
            done, send me the final code.
          </p>
        </div>
      </div>
    </div>
  );
}
