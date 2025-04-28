import { Form, FormLayout, Modal, TextField, Toast } from "@shopify/polaris";
import { useCallback, useState } from "react";

export default function ModalExample({ active, handleChange, id }) {
  const [tag, setTag] = useState("");
  const [activeToast, setActiveToast] = useState(false);

  const handleSubmit = useCallback(async () => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("tag", tag);

    await fetch(window.location.pathname, {
      method: "POST",
      body: formData,
    });

    setTag("");
    handleChange(); // đóng modal
    setActiveToast(true); // Hiện Toast

    // Sau 5s tự động ẩn Toast và reload
    setTimeout(() => {
      setActiveToast(false);
      window.location.reload();
    }, 500);
  }, [id, tag, handleChange]);

  const handleTagChange = useCallback((value) => setTag(value), []);

  const toastMarkup = activeToast ? (
    <Toast
      content="Tag added successfully!"
      onDismiss={() => setActiveToast(false)}
    />
  ) : null;

  return (
    <>
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

      {toastMarkup}
    </>
  );
}
