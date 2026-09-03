import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buildStudioMatrix,
  createStudioProduct,
  deleteStudioImage,
  deleteStudioProduct,
  deleteStudioVariant,
  getStudioOptions,
  getStudioProduct,
  patchStudioProduct,
  patchStudioVariant,
  uploadStudioImage,
} from "../api/client";
import { usePageTitle } from "../hooks/usePageTitle";

const EMPTY = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  care: "",
  features: [],
  shipping_note: "Shipping calculated at checkout.",
  gender: "unisex",
  status: "draft",
  category: "",
};

export function StudioProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  usePageTitle(isNew ? "New product" : "Edit product");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: options } = useQuery({ queryKey: ["studio-options"], queryFn: getStudioOptions });
  const { data: product, error } = useQuery({
    queryKey: ["studio-product", id],
    queryFn: () => getStudioProduct(id),
    enabled: !isNew,
  });

  const [form, setForm] = useState(EMPTY);
  const [featuresText, setFeaturesText] = useState("");
  const [colorIds, setColorIds] = useState([]);
  const [sizeIds, setSizeIds] = useState([]);
  const [price, setPrice] = useState("48");
  const [stock, setStock] = useState("20");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title,
      slug: product.slug,
      subtitle: product.subtitle || "",
      description: product.description || "",
      care: product.care || "",
      features: product.features || [],
      shipping_note: product.shipping_note || "",
      gender: product.gender,
      status: product.status,
      category: product.category || "",
    });
    setFeaturesText((product.features || []).join("\n"));
    setColorIds([...new Set((product.variants || []).map((row) => row.color))]);
    setSizeIds([...new Set((product.variants || []).map((row) => row.size).filter(Boolean))]);
    if (product.variants?.[0]) {
      setPrice(String(product.variants[0].price));
      setStock(String(product.variants[0].stock));
    }
  }, [product]);

  const colors = options?.colors || [];
  const sizes = options?.sizes || [];
  const categories = options?.categories || [];
  const missingImages = useMemo(() => {
    const withImages = new Set((product?.images || []).map((image) => image.color).filter(Boolean));
    return (product?.variants || [])
      .map((row) => row.color)
      .filter((colorId, index, list) => list.indexOf(colorId) === index && !withImages.has(colorId));
  }, [product]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const payload = () => ({
    ...form,
    category: form.category || null,
    features: featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  });

  const saveCopy = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (isNew) {
        const created = await createStudioProduct(payload());
        queryClient.invalidateQueries({ queryKey: ["studio-products"] });
        navigate(`/studio/products/${created.id}`, { replace: true });
        return;
      }
      await patchStudioProduct(id, payload());
      await queryClient.invalidateQueries({ queryKey: ["studio-product", id] });
      setMessage("Saved.");
    } catch (err) {
      setMessage(err.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const buildMatrix = async () => {
    setBusy(true);
    setMessage("");
    try {
      await buildStudioMatrix(id, { color_ids: colorIds, size_ids: sizeIds, price, stock });
      await queryClient.invalidateQueries({ queryKey: ["studio-product", id] });
      setMessage("Matrix updated.");
    } catch (err) {
      setMessage(err.message || "Matrix failed.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const onUpload = async (event) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const data = new FormData(formEl);
    if (!data.get("image") || data.get("image").size === 0) return;
    setBusy(true);
    try {
      await uploadStudioImage(id, data);
      formEl.reset();
      await queryClient.invalidateQueries({ queryKey: ["studio-product", id] });
    } catch (err) {
      setMessage(err.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!isNew && error) return <p className="studio-page studio-error">{error.message}</p>;
  if (!isNew && !product) return <p className="studio-page">Loading product…</p>;

  return (
    <div className="studio-page">
      <p className="eyebrow">
        <Link to="/studio/products">Products</Link>
      </p>
      <h1 className="display">{isNew ? "New product" : form.title || "Edit product"}</h1>
      {message ? <p className={message.includes("fail") ? "studio-error" : "studio-muted"}>{message}</p> : null}

      <form className="studio-form" onSubmit={saveCopy}>
        <label>
          Title
          <input value={form.title} onChange={(event) => setField("title", event.target.value)} required />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(event) => setField("slug", event.target.value)} placeholder="auto from title" />
        </label>
        <label>
          Subtitle
          <input value={form.subtitle} onChange={(event) => setField("subtitle", event.target.value)} />
        </label>
        <div className="studio-form__row">
          <label>
            Gender
            <select value={form.gender} onChange={(event) => setField("gender", event.target.value)}>
              <option value="unisex">Unisex</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
          </label>
          <label>
            Category
            <select value={form.category} onChange={(event) => setField("category", event.target.value)}>
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField("status", event.target.value)}>
              <option value="draft">Draft</option>
              <option value="live">Live</option>
            </select>
          </label>
        </div>
        <label>
          Description
          <textarea rows={4} value={form.description} onChange={(event) => setField("description", event.target.value)} />
        </label>
        <label>
          Care
          <textarea rows={3} value={form.care} onChange={(event) => setField("care", event.target.value)} />
        </label>
        <label>
          Features (one per line)
          <textarea rows={3} value={featuresText} onChange={(event) => setFeaturesText(event.target.value)} />
        </label>
        <label>
          Shipping note
          <input value={form.shipping_note} onChange={(event) => setField("shipping_note", event.target.value)} />
        </label>
        <button className="cta-volt neu-btn" type="submit" disabled={busy}>
          {isNew ? "Create product" : "Save copy"}
        </button>
      </form>

      {!isNew ? (
        <>
          <h2 className="studio-h2">Variant matrix</h2>
          <p className="page__lede">Pick colors and sizes, then build. Existing SKUs are left in place.</p>
          <div className="studio-chip-row">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={colorIds.includes(color.id) ? "studio-chip on" : "studio-chip"}
                onClick={() => toggle(colorIds, setColorIds, color.id)}
              >
                <i style={{ background: color.hex }} />
                {color.name}
              </button>
            ))}
          </div>
          <div className="studio-chip-row">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                className={sizeIds.includes(size.id) ? "studio-chip on" : "studio-chip"}
                onClick={() => toggle(sizeIds, setSizeIds, size.id)}
              >
                {size.name}
              </button>
            ))}
          </div>
          <div className="studio-form__row">
            <label>
              Default price
              <input value={price} onChange={(event) => setPrice(event.target.value)} />
            </label>
            <label>
              Default stock
              <input value={stock} onChange={(event) => setStock(event.target.value)} />
            </label>
            <button className="cta-volt neu-btn" type="button" onClick={buildMatrix} disabled={busy}>
              Build matrix
            </button>
          </div>
          {missingImages.length ? (
            <p className="studio-error">Colors without images will not show as storefront swatches.</p>
          ) : null}
          <table className="studio-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Color</th>
                <th>Size</th>
                <th>Price</th>
                <th>Compare</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(product.variants || []).map((variant) => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  onSaved={() => queryClient.invalidateQueries({ queryKey: ["studio-product", id] })}
                />
              ))}
            </tbody>
          </table>

          <h2 className="studio-h2">Images by color</h2>
          <p className="page__lede">Crop hint 4:5. Assign a color so the PDP gallery and card swatches stay in sync.</p>
          <div className="studio-grid">
            {(product.images || []).map((image) => (
              <figure key={image.id} className="studio-card">
                <div className="studio-frame" style={{ aspectRatio: "4 / 5" }}>
                  {image.url ? <img src={image.url} alt="" /> : <span>4:5</span>}
                </div>
                <p>
                  {image.color_slug || "no color"} · {image.kind}
                </p>
                <button
                  type="button"
                  className="text-link"
                  onClick={async () => {
                    await deleteStudioImage(image.id);
                    queryClient.invalidateQueries({ queryKey: ["studio-product", id] });
                  }}
                >
                  Remove
                </button>
              </figure>
            ))}
          </div>
          <form className="studio-form studio-form--inline" onSubmit={onUpload}>
            <label>
              Color
              <select name="color" defaultValue="">
                <option value="">None</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kind
              <select name="kind" defaultValue="card">
                <option value="card">Card</option>
                <option value="pdp">PDP</option>
                <option value="hero">Hero</option>
                <option value="look">Look</option>
              </select>
            </label>
            <label>
              File
              <input name="image" type="file" accept="image/*" required />
            </label>
            <button className="cta-volt neu-btn" type="submit" disabled={busy}>
              Upload
            </button>
          </form>

          <button
            type="button"
            className="studio-danger-btn"
            onClick={async () => {
              if (!window.confirm(`Delete “${form.title || "this product"}”? This cannot be undone.`)) return;
              setBusy(true);
              try {
                await deleteStudioProduct(id);
                queryClient.invalidateQueries({ queryKey: ["studio-products"] });
                navigate("/studio/products");
              } catch (err) {
                setMessage(err.message || "Could not delete this product.");
                setBusy(false);
              }
            }}
          >
            Delete product
          </button>
        </>
      ) : null}
    </div>
  );
}

function VariantRow({ variant, onSaved }) {
  const [price, setPrice] = useState(String(variant.price));
  const [compare, setCompare] = useState(variant.compare_at != null ? String(variant.compare_at) : "");
  const [stock, setStock] = useState(String(variant.stock));
  const [sku, setSku] = useState(variant.sku);

  const save = async () => {
    await patchStudioVariant(variant.id, {
      price,
      compare_at: compare || null,
      stock: Number(stock),
      sku,
    });
    onSaved();
  };

  return (
    <tr>
      <td>
        <input value={sku} onChange={(event) => setSku(event.target.value)} onBlur={save} />
      </td>
      <td>{variant.color_name}</td>
      <td>{variant.size_name}</td>
      <td>
        <input value={price} onChange={(event) => setPrice(event.target.value)} onBlur={save} />
      </td>
      <td>
        <input value={compare} onChange={(event) => setCompare(event.target.value)} onBlur={save} />
      </td>
      <td>
        <input value={stock} onChange={(event) => setStock(event.target.value)} onBlur={save} />
      </td>
      <td>
        <button
          type="button"
          className="text-link"
          onClick={async () => {
            await deleteStudioVariant(variant.id);
            onSaved();
          }}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
