import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
}

export const ProductTable = ({ products }: ProductTableProps) => {
  const navigate = useNavigate();

  const getHealthColor = (health: number) => {
    if (health >= 90) return "bg-success text-white";
    if (health >= 75) return "bg-info text-white";
    if (health >= 60) return "bg-warning text-white";
    return "bg-destructive text-white";
  };

  const getVisibilityColor = (visibility: number) => {
    if (visibility >= 80) return "bg-success text-white";
    if (visibility >= 65) return "bg-primary text-primary-foreground";
    if (visibility >= 50) return "bg-warning text-white";
    return "bg-destructive text-white";
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Visibility</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">SEO Health</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Issues</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <td className="py-4 px-4 font-medium">{product.name}</td>
                <td className="py-4 px-4 text-muted-foreground">{product.category}</td>
                <td className="py-4 px-4 text-center">
                  <Badge className={getVisibilityColor(product.visibility)}>
                    {product.visibility}%
                  </Badge>
                </td>
                <td className="py-4 px-4 text-center">
                  <Badge className={getHealthColor(product.seoHealth)}>
                    {product.seoHealth}%
                  </Badge>
                </td>
                <td className="py-4 px-4 text-center">
                  {product.brokenLinks > 0 ? (
                    <span className="text-destructive font-medium">{product.brokenLinks} broken links</span>
                  ) : (
                    <span className="text-success">✓ No issues</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.id}`);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
