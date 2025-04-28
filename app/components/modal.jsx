import { Form, FormLayout, Modal, TextField } from "@shopify/polaris";
import { useCallback, useState } from "react";

export default function ModalExample({ active, handleChange, id }) {
  const [tag, setTag] = useState("");

  const handleSubmit = useCallback(async () => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("tag", tag);

    await fetch(window.location.pathname, {
      method: "POST",
      body: formData,
    });

    setTag("");
    handleChange();
    window.location.reload(); // 🆕 Reload lại page để thấy Tag mới
  }, [id, tag, handleChange]);

  const handleTagChange = useCallback((value) => setTag(value), []);

  return (
    <Modal
      open={active}
      onClose={handleChange}
      title="Add tags to your products"
      primaryAction={{
        content: "Add Tag",
        onAction: handleSubmit,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleChange,
        },
      ]}
    >
      <Modal.Section>
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              value={tag}
              onChange={handleTagChange}
              label="Tag"
              type="text"
              autoComplete="off"
              helpText="Add a new tag to this product"
            />
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  );
}
