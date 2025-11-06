import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Alert, Modal, Upload, Popover, Image, Table, Input, Button, Select, Card, Row, Col, Tag, message, InputNumber } from "antd";
import axios from "axios";
import { UploadOutlined, SearchOutlined, PlusOutlined, DeleteOutlined, StopOutlined } from "@ant-design/icons";
import '../../CSS/AdminCSS/AdminMenu.css';
const { Option } = Select;

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    available_amount: '',
    categoryId: undefined,
    image_url: ''
  });
  const [addStock, setAddStock] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentThreshold, setCurrentThreshold] = useState(undefined);
  const [filterCategory, setFilterCategory] = useState(undefined);
  const [filterSales, setFilterSales] = useState('');
  const [filterSalesToday, setFilterSalesToday] = useState('');
  const [filterName, setFilterName] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchMenuItems();
      await fetchCategories();
      await fetchLowStockThreshold();
    };

    initialize();
  }, []);

  const handleExportToExcel = () => {
    const exportData = filteredItems.map(item => ({
      "Item ID": item.item_id,
      "Name": item.name,
      "Description": item.description || "-",
      "Price (RM)": Number(item.price).toFixed(2),
      "Stock Available": item.available_amount,
      "Category": item.categoryName || "-",
      "Total Sales": item.total_sales || 0,
      "Sales Today": item.sales_today || 0,
      "Status": item.is_available ? "Available" : "Not Available"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MenuItems");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `MenuItems_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const fetchLowStockThreshold = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/low-stock");
      const lowStockItems = res.data.lowStockItems;
      const thresholdFromDB = res.data.threshold;
      setLowStockAlerts(lowStockItems);
      setCurrentThreshold(parseInt(thresholdFromDB));
    } catch (err) {
      console.error("Failed to fetch threshold or low stock items", err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/items");
      const items = res.data;

      setMenuItems(items);
      setFilteredItems(items);

      setAddStock((prevStock) => {
        const updatedStock = { ...prevStock };
        items.forEach(item => {
          if (!(item.item_id in updatedStock)) {
            updatedStock[item.item_id] = 0;
          }
        });
        return updatedStock;
      });

    } catch {
      message.error("Failed to fetch menu items");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/items/categories");
      setCategories(res.data);
    } catch {
      message.error("Failed to fetch categories");
    }
  };

  const handleEditSave = async () => {
    if (!editingItem) return;
    const { item_id } = editingItem;

    const wasLowStockView =
      currentThreshold !== undefined &&
      filteredItems.length > 0 &&
      filteredItems.every(item => item.available_amount <= currentThreshold);

    const payload = {
      name: (editingItem.name || '').trim(),
      description: editingItem.description || '',
      price: Number(editingItem.price) || 0,
      available_amount: Number(editingItem.available_amount) || 0,
      categoryId: Number(editingItem.categoryId),
      image_url: editingItem.image_url || null,
    };

    try {
      await axios.put(`http://localhost:3000/api/items/menu-items/${item_id}`, payload);
      message.success('Item updated successfully');
    } catch (err) {
      message.error('Failed to update item');
      return;
    }

    try {
      const res = await axios.get('http://localhost:3000/api/items');
      const all = res.data;
      setMenuItems(all);

      let filtered = [...all];

      if (filterCategory !== undefined) {
        filtered = filtered.filter(item => item.categoryId === filterCategory);
      }
      if (filterSales) {
        filtered = filtered.filter(item => item.total_sales >= parseFloat(filterSales));
      }
      if (filterSalesToday) {
        filtered = filtered.filter(item => item.sales_today >= parseFloat(filterSalesToday));
      }
      if (filterName) {
        filtered = filtered.filter(item =>
          item.name?.toLowerCase().includes(filterName.toLowerCase())
        );
      }
      if (wasLowStockView && currentThreshold !== undefined) {
        filtered = filtered.filter(item => item.available_amount <= currentThreshold);
      }

      setFilteredItems(filtered);
    } catch (e) {
      console.warn('Post-update refresh failed:', e);
    } finally {
      setEditModalVisible(false);
      setEditingItem(null);
    }

    try {
      await refreshLowStockAlerts();
    } catch (e) {
      console.warn('Low-stock refresh failed:', e);
    }
  };

  const refreshLowStockAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/low-stock");
      const lowStockItems = res.data.lowStockItems;
      const thresholdFromDB = res.data.threshold;
      setLowStockAlerts(lowStockItems);
      setCurrentThreshold(parseInt(thresholdFromDB));
    } catch (err) {
      console.error("Failed to refresh low stock alerts", err);
    }
  };

  const handleImageUploadForEdit = async ({ file }) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post("http://localhost:3000/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditingItem(prev => ({ ...prev, image_url: res.data.imageUrl }));
      message.success("Image uploaded");
    } catch (err) {
      console.error(err);
      message.error("Image upload failed");
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.available_amount || !newItem.categoryId) {
      return message.warning("Please fill all fields");
    }
    try {
      await axios.post("http://localhost:3000/api/items/menu-items", newItem);
      fetchMenuItems();
      setNewItem({ name: '', description: '', price: '', available_amount: '', categoryId: undefined });
      message.success("Item added successfully");
    } catch {
      message.error("Failed to add item");
    }
  };

  const handleFlag = async (itemId) => {
    try {
      await axios.put(`http://localhost:3000/api/items/menu-items/${itemId}/flag`);
      await fetchMenuItems();
      message.success("Item availability updated");
    } catch {
      message.error("Failed to update availability");
    }
  };

  const handleDelete = async (itemId) => {
    await axios.delete(`http://localhost:3000/api/items/menu-items/${itemId}`);
    fetchMenuItems();
    message.success("Item deleted");
  };

  const applyFilters = () => {
    let filtered = [...menuItems];

    if (filterCategory !== undefined) {
      filtered = filtered.filter((item) => item.categoryId === filterCategory);
    }

    if (filterSales) {
      filtered = filtered.filter(
        (item) => item.total_sales >= parseFloat(filterSales)
      );
    }

    if (filterSalesToday) {
      filtered = filtered.filter(
        (item) => item.sales_today >= parseFloat(filterSalesToday)
      );
    }

    if (filterName) {
      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleFilter = () => {
    setLowStockOnly(false);
    applyFilters();
  };

  const handleResetFilter = () => {
    setFilterName("");
    setFilterCategory(undefined);
    setFilterSales("");
    setFilterSalesToday("");
    setFilteredItems(menuItems);
    setLowStockOnly(false);
  };

  const handleConfirmStockUpdate = async () => {
    try {
      const updates = Object.entries(addStock).map(([itemId, addAmount]) => {
        const original = menuItems.find(item => item.item_id === parseInt(itemId))?.available_amount || 0;
        const newAmount = original + addAmount;
        return axios.put(`http://localhost:3000/api/items/menu-items/${itemId}/stock`, {
          available_amount: newAmount,
        });
      });

      await Promise.all(updates);
      message.success("Stock updated successfully");

      setAddStock(prev => Object.fromEntries(Object.keys(prev).map(k => [k, 0])));

      const res = await axios.get("http://localhost:3000/api/items");
      const latest = res.data;
      setMenuItems(latest);

      if (lowStockOnly && currentThreshold !== undefined) {
        setFilteredItems(latest.filter(it => it.available_amount <= currentThreshold));
      } else {
        let filtered = [...latest];
        if (filterCategory !== undefined) {
          filtered = filtered.filter(it => it.categoryId === filterCategory);
        }
        if (filterSales) {
          filtered = filtered.filter(it => it.total_sales >= parseFloat(filterSales));
        }
        if (filterSalesToday) {
          filtered = filtered.filter(it => it.sales_today >= parseFloat(filterSalesToday));
        }
        if (filterName) {
          filtered = filtered.filter(it =>
            it.name?.toLowerCase().includes(filterName.toLowerCase())
          );
        }
        setFilteredItems(filtered);
      }

      await refreshLowStockAlerts();
    } catch {
      message.error("Failed to update stock");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (text, record) => (
        <div className={currentThreshold !== undefined && record.available_amount <= currentThreshold ? 'low-stock-cell' : ''}>
          {currentThreshold !== undefined && record.available_amount <= currentThreshold ? '⚠️ ' : ''}{text}
        </div>
      )
    },

    {
      title: "Image",
      key: "image",
      width: 100,
      render: (_, record) =>
        record.image_url ? (
          <Popover
            content={
              <Image
                src={`http://localhost:3000${record.image_url}`}
                alt={record.name}
                width={200}
                preview={false}
              />
            }
            placement="right"
            trigger="hover"
          >
            <Image src={`http://localhost:3000${record.image_url}`} alt={record.name} width={60} height={60} style={{ objectFit: "cover", borderRadius: 4 }} preview={false}
            />
          </Popover>
        ) : (
          "No image"
        )
    },

    { title: "Price", dataIndex: "price", key: "price", width: 110, render: (v) => `RM${v}` },
    {
      title: "Stock",
      dataIndex: "available_amount",
      key: "available_amount",
      width: 100,
    },
    { title: "Category", dataIndex: "categoryName", key: "categoryName", width: 140, ellipsis: true },
    { title: "Total Sales", dataIndex: "total_sales", key: "total_sales", width: 120, },
    { title: "Sales Today", dataIndex: "sales_today", key: "sales_today", width: 130, },
    {
      title: "Status", key: "is_available", dataIndex: "is_available", width: 120,
      render: (available) => <Tag color={available ? "green" : "red"}>{available ? "Available" : "Not Available"}</Tag>
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            icon={<StopOutlined />}
            onClick={() => handleFlag(record.item_id)}
            block size="small" style={{ marginRight: 8 }}
          >
            {record.is_available ? "Disable" : "Enable"}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.item_id)}
            block size="small" style={{ marginTop: 8 }}
          >
            Delete
          </Button>
          <Button
            block size="small" style={{ marginTop: 8 }}
            onClick={() => {
              setEditingItem(record);
              setEditModalVisible(true);
            }}
          >
            Edit
          </Button>
        </div>
      )
    },
    {
      title: "Add Stock",
      key: "add_stock",
      width: 170,
      render: (_, record) => {
        const stockValue = (addStock[record.item_id] ?? 0).toString();

        return (
          <div className="add-stock-group">
            <Button
              size="small"
              onClick={() =>
                setAddStock((prev) => ({
                  ...prev,
                  [record.item_id]: Math.max((prev[record.item_id] || 0) - 1, 0),
                }))
              }
            >
              -
            </Button>
            <Input
              readOnly
              value={stockValue}
              style={{
                width: `${Math.min(Math.max((stockValue || '0').length + 1, 3), 6)}ch`,
                textAlign: 'center'
              }}
            />
            <Button
              size="small"
              onClick={() =>
                setAddStock((prev) => ({
                  ...prev,
                  [record.item_id]: (prev[record.item_id] || 0) + 1,
                }))
              }
            >
              +
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className='admin-menu-container'>
      {lowStockAlerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {lowStockAlerts.map((item) => (
            <Alert
              key={item.item_id}
              message={`Low Stock: ${item.name} only has ${item.available_amount} left.`}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 8 }}
            />
          ))}
        </div>
      )}
      <Card title="Add New Menu Item" style={{ marginBottom: 40 }}>
        <Row gutter={[16, 16]}>
          {/* Name Input */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Input
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </Col>

          {/* Description Input */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Input
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </Col>

          {/* Price Input */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </Col>

          {/* Stock Input */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Input
              type="number"
              placeholder="Stock"
              value={newItem.available_amount}
              onChange={(e) => setNewItem({ ...newItem, available_amount: e.target.value })}
            />
          </Col>

          {/* Category Dropdown */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Select
              placeholder="Category"
              value={newItem.categoryId}
              onChange={(value) => setNewItem({ ...newItem, categoryId: value })}
              style={{ width: "100%" }}
            >
              {categories.map((cat) => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Image Upload */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Upload
              name="image"
              showUploadList={false}
              customRequest={async ({ file, onSuccess, onError }) => {
                const formData = new FormData();
                formData.append("image", file);

                try {
                  const res = await axios.post("http://localhost:3000/api/upload/image", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  setNewItem((prev) => ({ ...prev, image_url: res.data.imageUrl }));
                  message.success("Image uploaded");
                  onSuccess("ok");
                } catch (err) {
                  console.error(err);
                  message.error("Upload failed");
                  onError(err);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Col>

          {/* Image Preview */}
          {newItem.image_url && (
            <Col span={3}>
              <img
                src={`http://localhost:3000${newItem.image_url}`}
                alt="Preview"
                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: 4 }}
              />
            </Col>
          )}

          {/* Add Button */}
          <Col span={3}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
              style={{ width: "100%" }}
            >
              Add
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="Filter Menu Items" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by Item Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Category"
              allowClear
              value={filterCategory ?? undefined}
              onChange={(value) => setFilterCategory(value)}
              style={{ width: "100%" }}
            >
              {categories.map((cat) => (
                <Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              type="number"
              placeholder="Min Total Sales"
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              danger
              icon={<StopOutlined />}
              onClick={() => {
                if (currentThreshold !== undefined) {
                  const lowStockItems = menuItems.filter(item => item.available_amount <= currentThreshold);
                  setFilteredItems(lowStockItems);
                  setLowStockOnly(true);
                } else {
                  message.warning("Low stock threshold not loaded yet.");
                }
              }}
              style={{ marginTop: 0 }}
            >
              Show Low Stock Items Only
            </Button>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                icon={<SearchOutlined />}
                type="primary"
                onClick={handleFilter}
                style={{ width: "100%" }}
              >
                Filter
              </Button>
              <Button onClick={handleResetFilter} style={{ width: "100%", marginTop: 10 }}>
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {Object.values(addStock).some(val => val > 0) && (
        <Card>
          <Button type="primary" onClick={handleConfirmStockUpdate}>
            Confirm Stock Update
          </Button>
        </Card>
      )}

      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Menu Items List</span>
            <div style={{ flexShrink: 0 }}>
              <Button
                onClick={handleExportToExcel}
                style={{ fontSize: "14px", height: "36px" }}
              >
                Export to XLS
              </Button>
            </div>
          </div>
        }
      >
        <div className="responsive-table-container">
          <Table
            columns={columns}
            dataSource={filteredItems}
            rowKey="item_id"
            tableLayout="fixed"
            pagination={{ pageSize: 10 }}
            rowClassName={(record) =>
              currentThreshold !== undefined && record.available_amount <= currentThreshold
                ? 'low-stock-row'
                : ''
            }
          />
        </div>
      </Card>

      {editingItem && (
        <Modal
          title="Edit Menu Item"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <label>Name</label>
              <Input
                placeholder="Item Name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              />
            </Col>

            <Col span={24}>
              <label>Description</label>
              <Input.TextArea
                placeholder="Description"
                autoSize={{ minRows: 3, maxRows: 6 }}
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              />
            </Col>

            <Col xs={24} sm={12}>
              <label>Price (RM)</label>
              <InputNumber
                step={1}
                min={1}
                type="number"
                placeholder="Price"
                value={editingItem.price}
                onChange={(value) =>
                  setEditingItem({ ...editingItem, price: value })
                }
              />
            </Col>

            <Col xs={24} sm={12}>
              <label>Stock</label>
              <InputNumber
                type="number"
                step={1}
                min={0}
                placeholder="Stock"
                value={editingItem.available_amount}
                onChange={(value) => {
                  const parsed = parseInt(value) || 0;
                  setEditingItem({ ...editingItem, available_amount: parsed });
                }}
              />
            </Col>

            <Col span={24}>
              <label>Category</label>
              <Select
                value={editingItem.categoryId}
                onChange={(value) => setEditingItem({ ...editingItem, categoryId: value })}
                style={{ width: '100%' }}
              >
                {categories.map(cat => (
                  <Option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={24} style={{ marginTop: 15 }}>
              <label>Upload New Image</label>
              <Row gutter={16} align="top">
                <Col>
                  <Upload
                    name="image"
                    showUploadList={false}
                    customRequest={handleImageUploadForEdit}
                  >
                    <Button icon={<UploadOutlined />}>Upload Image</Button>
                  </Upload>
                </Col>
                {editingItem.image_url && (
                  <Col>
                    <Image
                      src={`http://localhost:3000${editingItem.image_url}`}
                      alt="Preview"
                      width={100}
                      height={100}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                  </Col>
                )}
              </Row>
            </Col>

            <Col span={24}>
              <Row justify="end" style={{ marginBottom: 0 }}>
                <Col>
                  <Button
                    danger
                    type="default"
                    size="large"
                    style={{ width: 120, height: 40 }}
                    onClick={() => setEditModalVisible(false)}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
              <Row justify="end">
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    style={{ width: 120, height: 40 }}
                    onClick={handleEditSave}
                  >
                    Save
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Modal>
      )}
    </div>
  );
};

export default AdminMenu;
